import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import mongoose from 'mongoose';

// PUT /api/teams/[id]/members/[memberId] - Update member role/permissions
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id, memberId } = await params;
    const body = await request.json();
    const { role, status } = body;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { error: 'Invalid team or member ID' },
        { status: 400 }
      );
    }

    // Find team
    const team = await Team.findById(id)
      .populate('members.userId', 'firstName lastName email image');

    if (!team || !team.isActive || team.isArchived) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user can manage this team
    if (!team.canUserManage(session.user.id)) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to manage team members.' },
        { status: 403 }
      );
    }

    // Find the member to update
    const memberToUpdate = team.members.find(member =>
      member._id.toString() === memberId
    );

    if (!memberToUpdate) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 400 }
      );
    }

    // Prevent owner from changing their own role
    const isOwner = team.ownerId.toString() === session.user.id;
    const isUpdatingOwner = memberToUpdate.userId._id.toString() === team.ownerId.toString();

    if (isUpdatingOwner && role && role !== 'owner') {
      return NextResponse.json(
        { error: 'Cannot change owner role. Transfer ownership first.' },
        { status: 400 }
      );
    }

    // Update role if provided
    if (role) {
      if (!['viewer', 'editor', 'admin', 'owner'].includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be viewer, editor, admin, or owner' },
          { status: 400 }
        );
      }

      // Only owner can assign admin or owner roles
      if (['admin', 'owner'].includes(role) && !isOwner) {
        return NextResponse.json(
          { error: 'Only team owner can assign admin or owner roles' },
          { status: 403 }
        );
      }

      try {
        await team.updateMemberRole(memberToUpdate.userId._id, role);
      } catch (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Update status if provided
    if (status) {
      if (!['active', 'pending', 'suspended'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be active, pending, or suspended' },
          { status: 400 }
        );
      }

      memberToUpdate.status = status;

      // Set joinedAt when status changes to active
      if (status === 'active' && !memberToUpdate.joinedAt) {
        memberToUpdate.joinedAt = new Date();
      }

      await team.save();
    }

    // Refresh team data
    await team.populate('members.userId', 'firstName lastName email image');
    await team.populate('members.invitedBy', 'firstName lastName email');

    const updatedMember = team.members.find(member =>
      member._id.toString() === memberId
    );

    return NextResponse.json({
      message: 'Member updated successfully',
      member: {
        id: updatedMember._id,
        user: {
          id: updatedMember.userId._id,
          name: `${updatedMember.userId.firstName} ${updatedMember.userId.lastName}`,
          email: updatedMember.userId.email,
          avatar: updatedMember.userId.avatar
        },
        role: updatedMember.role,
        status: updatedMember.status,
        permissions: updatedMember.permissions,
        invitedBy: updatedMember.invitedBy ? {
          id: updatedMember.invitedBy._id,
          name: `${updatedMember.invitedBy.firstName} ${updatedMember.invitedBy.lastName}`,
          email: updatedMember.invitedBy.email
        } : null,
        invitedAt: updatedMember.invitedAt,
        joinedAt: updatedMember.joinedAt
      }
    });

  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]/members/[memberId] - Remove member from team
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id, memberId } = await params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { error: 'Invalid team or member ID' },
        { status: 400 }
      );
    }

    // Find team
    const team = await Team.findById(id);

    if (!team || !team.isActive || team.isArchived) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Find the member to remove
    const memberToRemove = team.members.find(member =>
      member._id.toString() === memberId
    );

    if (!memberToRemove) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const isOwner = team.ownerId.toString() === session.user.id;
    const isRemovingOwner = memberToRemove.userId.toString() === team.ownerId.toString();
    const isRemovingSelf = memberToRemove.userId.toString() === session.user.id;

    // Check permissions
    if (!isOwner && !isRemovingSelf) {
      // Check if user can manage team members
      const userMember = team.getMember(session.user.id);
      if (!userMember || !userMember.permissions.canManageTeam) {
        return NextResponse.json(
          { error: 'Access denied. You do not have permission to remove team members.' },
          { status: 403 }
        );
      }
    }

    // Prevent removing the owner
    if (isRemovingOwner) {
      return NextResponse.json(
        { error: 'Cannot remove team owner. Transfer ownership first.' },
        { status: 400 }
      );
    }

    // Remove member
    try {
      await team.removeMember(memberToRemove.userId);
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: isRemovingSelf ? 'Left team successfully' : 'Member removed successfully'
    });

  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
