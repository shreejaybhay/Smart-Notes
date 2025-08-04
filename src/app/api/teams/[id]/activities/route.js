import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import Team from '@/models/Team';

// GET /api/teams/[id]/activities - Get team activities
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

    const { id: teamId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Check if user has access to this team
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is a member of this team
    const userMember = team.getMember(session.user.id);
    if (!userMember) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get activities
    const activities = await Activity.getTeamActivities(teamId, {
      limit,
      skip,
      type,
      userId
    });

    // Get total count for pagination
    const totalQuery = { teamId, isVisible: true };
    if (type) totalQuery.type = type;
    if (userId) totalQuery.userId = userId;

    const total = await Activity.countDocuments(totalQuery);
    const totalPages = Math.ceil(total / limit);

    // Format activities with user-friendly messages
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      type: activity.type,
      description: activity.description,
      message: activity.getFormattedMessage(),
      user: activity.userId ? {
        id: activity.userId._id,
        name: `${activity.userId.firstName} ${activity.userId.lastName}`,
        email: activity.userId.email,
        avatar: activity.userId.avatar
      } : null,
      resourceId: activity.resourceId,
      resourceType: activity.resourceType,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt
    }));

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching team activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teams/[id]/activities - Create a new activity (internal use)
export async function POST(request, { params }) {
  try {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('POST /api/teams/[id]/activities - Starting...');
    }

    const session = await auth();
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Session:', session ? 'authenticated' : 'not authenticated');
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connected');
    }

    const { id: teamId } = await params;
    const body = await request.json();
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request body:', body);
      console.log('Team ID:', teamId);
    }

    const {
      type,
      description,
      resourceId,
      resourceType,
      metadata = {}
    } = body;

    // Validate required fields
    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description are required' },
        { status: 400 }
      );
    }

    // Check if user has access to this team
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is a member of this team
    const userMember = team.getMember(session.user.id);
    if (!userMember) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create activity
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating activity with data:', {
        teamId,
        userId: session.user.id,
        type,
        description,
        resourceId,
        resourceType,
        metadata
      });
    }

    const activity = await Activity.createActivity({
      teamId,
      userId: session.user.id,
      type,
      description,
      resourceId,
      resourceType,
      metadata
    });

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Activity created:', activity);
    }

    // Populate user data
    await activity.populate('userId', 'firstName lastName email avatar');
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Activity populated:', activity);
    }

    const formattedActivity = {
      id: activity._id,
      type: activity.type,
      description: activity.description,
      message: activity.getFormattedMessage(),
      user: {
        id: activity.userId._id,
        name: `${activity.userId.firstName} ${activity.userId.lastName}`,
        email: activity.userId.email,
        avatar: activity.userId.avatar
      },
      resourceId: activity.resourceId,
      resourceType: activity.resourceType,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt
    };

    return NextResponse.json({
      activity: formattedActivity
    }, { status: 201 });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating team activity:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
