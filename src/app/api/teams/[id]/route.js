import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Note from '@/models/Note';
import mongoose from 'mongoose';

// GET /api/teams/[id] - Get a specific team
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Find team
    const team = await Team.findById(id)
      .populate('ownerId', 'firstName lastName email image')
      .populate('members.userId', 'firstName lastName email image')
      .populate('members.invitedBy', 'firstName lastName email');

    if (!team || !team.isActive || team.isArchived) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this team
    if (!team.canUserAccess(session.user.id)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const userMember = team.getMember(session.user.id);
    const isOwner = team.ownerId._id.toString() === session.user.id;

    // Find current user in members for permissions
    const currentUserMember = team.members.find(member => {
      let memberUserId;
      if (typeof member.userId === 'object' && member.userId._id) {
        memberUserId = member.userId._id.toString();
      } else if (typeof member.userId === 'object' && member.userId.toString) {
        memberUserId = member.userId.toString();
      } else {
        memberUserId = member.userId;
      }
      return memberUserId === session.user.id && member.status === 'active';
    });

    return NextResponse.json({
      team: {
        id: team._id,
        name: team.name,
        description: team.description,
        slug: team.slug,
        avatar: team.avatar,
        color: team.color,
        isOwner,
        userRole: isOwner ? 'owner' : userMember?.role || 'viewer',
        userPermissions: userMember?.permissions || {},
        memberCount: team.memberCount,
        members: team.members.map(member => ({
          id: member._id,
          user: {
            id: member.userId._id,
            name: `${member.userId.firstName} ${member.userId.lastName}`,
            email: member.userId.email,
            image: member.userId.image
          },
          role: member.role,
          status: member.status,
          permissions: member.permissions,
          invitedBy: member.invitedBy ? {
            id: member.invitedBy._id,
            name: `${member.invitedBy.firstName} ${member.invitedBy.lastName}`,
            email: member.invitedBy.email
          } : null,
          invitedAt: member.invitedAt,
          joinedAt: member.joinedAt
        })),
        stats: {
          ...team.stats,
          totalNotes: await Note.countDocuments({
            teamId: team._id,
            deleted: false
          }),
          totalMembers: team.members.length
        },
        settings: team.settings,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        currentUser: currentUserMember ? {
          role: currentUserMember.role,
          permissions: currentUserMember.permissions,
          status: currentUserMember.status
        } : null
      }
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching team:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch team',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[id] - Update a team
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

    const { id } = await params;
    const body = await request.json();
    const { name, description, settings, color, avatar } = body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
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

    // Check if user can manage this team
    if (!team.canUserManage(session.user.id)) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to manage this team.' },
        { status: 403 }
      );
    }

    // Validation
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Team name is required' },
          { status: 400 }
        );
      }

      if (name.length > 100) {
        return NextResponse.json(
          { error: 'Team name cannot be more than 100 characters' },
          { status: 400 }
        );
      }

      if (name.length < 2) {
        return NextResponse.json(
          { error: 'Team name must be at least 2 characters' },
          { status: 400 }
        );
      }

      // Check for duplicate name (excluding current team)
      const existingTeam = await Team.findOne({
        ownerId: session.user.id,
        name: name.trim(),
        _id: { $ne: id },
        isActive: true,
        isArchived: false
      });

      if (existingTeam) {
        return NextResponse.json(
          { error: 'You already have a team with this name' },
          { status: 400 }
        );
      }

      team.name = name.trim();
    }

    if (description !== undefined) {
      if (description && description.length > 500) {
        return NextResponse.json(
          { error: 'Description cannot be more than 500 characters' },
          { status: 400 }
        );
      }
      team.description = description?.trim() || '';
    }

    if (settings) {
      team.settings = {
        ...team.settings,
        ...settings
      };
    }

    if (color) {
      team.color = color;
    }

    if (avatar !== undefined) {
      team.avatar = avatar;
    }

    await team.save();

    // Populate for response
    await team.populate('ownerId', 'firstName lastName email image');
    await team.populate('members.userId', 'firstName lastName email image');

    const userMember = team.getMember(session.user.id);
    const isOwner = team.ownerId._id.toString() === session.user.id;

    return NextResponse.json({
      message: 'Team updated successfully',
      team: {
        id: team._id,
        name: team.name,
        description: team.description,
        slug: team.slug,
        avatar: team.avatar,
        color: team.color,
        isOwner,
        userRole: isOwner ? 'owner' : userMember?.role || 'viewer',
        memberCount: team.memberCount,
        stats: {
          ...team.stats,
          totalNotes: await Note.countDocuments({
            teamId: team._id,
            isTeamNote: true
          }),
          totalMembers: team.members.length
        },
        settings: team.settings,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating team:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A team with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id] - Delete/Archive a team
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

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Find team
    const team = await Team.findById(id);

    if (!team || !team.isActive) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Only owner can delete team
    if (team.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied. Only team owner can delete the team.' },
        { status: 403 }
      );
    }

    // Archive the team instead of hard delete
    team.isArchived = true;
    team.archivedAt = new Date();
    await team.save();

    return NextResponse.json({
      message: 'Team archived successfully'
    });

  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
