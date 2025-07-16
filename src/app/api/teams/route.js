import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';

// GET /api/teams - Get all teams for the authenticated user
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';

    // Build query
    let query = {
      $or: [
        { ownerId: session.user.id },
        { 'members.userId': session.user.id, 'members.status': 'active' }
      ],
      isActive: true
    };

    if (!includeArchived) {
      query.isArchived = false;
    }

    // Find teams where user is owner or member
    const teams = await Team.find(query)
      .populate('ownerId', 'firstName lastName email avatar')
      .populate('members.userId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    // Transform teams for response
    const transformedTeams = teams.map(team => {
      const userMember = team.members.find(member => 
        member.userId._id.toString() === session.user.id
      );
      
      const isOwner = team.ownerId._id.toString() === session.user.id;
      
      return {
        id: team._id,
        name: team.name,
        description: team.description,
        slug: team.slug,
        avatar: team.avatar,
        color: team.color,
        isOwner,
        userRole: isOwner ? 'owner' : userMember?.role || 'viewer',
        memberCount: team.memberCount,
        stats: team.stats,
        settings: team.settings,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      };
    });

    return NextResponse.json({
      teams: transformedTeams,
      total: transformedTeams.length
    });

  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team
export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, description, settings, color, avatar } = body;

    // Validation
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

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Description cannot be more than 500 characters' },
        { status: 400 }
      );
    }

    // Check if user already has a team with this name
    const existingTeam = await Team.findOne({
      ownerId: session.user.id,
      name: name.trim(),
      isActive: true,
      isArchived: false
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'You already have a team with this name' },
        { status: 400 }
      );
    }

    // Create new team
    const team = new Team({
      name: name.trim(),
      description: description?.trim() || '',
      ownerId: session.user.id,
      settings: {
        isPublic: settings?.isPublic || false,
        allowPublicJoin: settings?.allowPublicJoin || false,
        requireApproval: settings?.requireApproval !== false, // default true
        defaultMemberRole: settings?.defaultMemberRole || 'viewer',
        maxMembers: settings?.maxMembers || 50
      },
      color: color || '#6366f1',
      avatar: avatar || null
    });

    // Add owner as first member
    team.members.push({
      userId: session.user.id,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      permissions: {
        canCreateNotes: true,
        canEditNotes: true,
        canDeleteNotes: true,
        canInviteMembers: true,
        canManageTeam: true
      }
    });

    await team.save();

    // Populate owner and members for response
    await team.populate('ownerId', 'firstName lastName email avatar');
    await team.populate('members.userId', 'firstName lastName email avatar');

    return NextResponse.json({
      message: 'Team created successfully',
      team: {
        id: team._id,
        name: team.name,
        description: team.description,
        slug: team.slug,
        avatar: team.avatar,
        color: team.color,
        isOwner: true,
        userRole: 'owner',
        memberCount: team.memberCount,
        stats: team.stats,
        settings: team.settings,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating team:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A team with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
