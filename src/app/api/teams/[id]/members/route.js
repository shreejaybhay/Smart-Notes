import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

// GET /api/teams/[id]/members - Get team members
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

    const members = team.members.map(member => ({
      id: member._id,
      user: {
        id: member.userId._id,
        name: `${member.userId.firstName} ${member.userId.lastName}`,
        email: member.userId.email,
        avatar: member.userId.avatar
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
    }));

    return NextResponse.json({
      members,
      total: members.length
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST /api/teams/[id]/members - Invite a member to the team
export async function POST(request, { params }) {
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
    const { email, role = 'viewer' } = body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be viewer, editor, or admin' },
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

    // Check if user can invite members
    const userMember = team.getMember(session.user.id);
    const isOwner = team.ownerId.toString() === session.user.id;

    if (!isOwner && (!userMember || !userMember.permissions.canInviteMembers)) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to invite members.' },
        { status: 403 }
      );
    }

    // Find user by email
    const userToInvite = await User.findOne({ email: email.trim().toLowerCase() });

    if (!userToInvite) {
      return NextResponse.json(
        { error: 'User with this email does not exist' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = team.getMember(userToInvite._id);
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      );
    }

    // Check team member limit
    if (team.members.length >= team.settings.maxMembers) {
      return NextResponse.json(
        { error: `Team has reached the maximum limit of ${team.settings.maxMembers} members` },
        { status: 400 }
      );
    }

    // Add member to team
    try {
      await team.addMember(userToInvite._id, role, session.user.id);
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log activity for member invitation
    try {
      await Activity.createActivity({
        teamId: id,
        userId: session.user.id,
        type: 'member_invited',
        description: `Invited ${userToInvite.firstName} ${userToInvite.lastName} to the team`,
        resourceId: userToInvite._id,
        resourceType: 'user',
        metadata: {
          invitedEmail: email,
          invitedRole: role,
          invitedUserName: `${userToInvite.firstName} ${userToInvite.lastName}`
        }
      });
      console.log('Member invitation activity logged successfully');
    } catch (activityError) {
      console.error('Error logging member invitation activity:', activityError);
      // Don't fail the invitation if activity logging fails
    }

    // Populate the new member data
    await team.populate('members.userId', 'firstName lastName email image');
    await team.populate('members.invitedBy', 'firstName lastName email');

    const newMember = team.members.find(member =>
      member.userId._id.toString() === userToInvite._id.toString()
    );

    return NextResponse.json({
      message: 'Member invited successfully',
      member: {
        id: newMember._id,
        user: {
          id: newMember.userId._id,
          name: `${newMember.userId.firstName} ${newMember.userId.lastName}`,
          email: newMember.userId.email,
          avatar: newMember.userId.avatar
        },
        role: newMember.role,
        status: newMember.status,
        permissions: newMember.permissions,
        invitedBy: {
          id: newMember.invitedBy._id,
          name: `${newMember.invitedBy.firstName} ${newMember.invitedBy.lastName}`,
          email: newMember.invitedBy.email
        },
        invitedAt: newMember.invitedAt,
        joinedAt: newMember.joinedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}
