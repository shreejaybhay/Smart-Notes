import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';

// POST /api/test-activity - Create a test activity
export async function POST(request) {
  try {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Testing activity creation...');
    }

    const session = await auth();
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
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connected');
    }

    const body = await request.json();
    const { teamId } = body;

    if (process.env.NODE_ENV === 'development') {
      console.log('Creating test activity for team:', teamId);
    }

    // Create test activity
    const activity = await Activity.createActivity({
      teamId,
      userId: session.user.id,
      type: 'team_created',
      description: 'Test activity created',
      metadata: {
        test: true
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Test activity created:', activity);
    }

    return NextResponse.json({
      message: 'Test activity created successfully',
      activity: {
        id: activity._id,
        type: activity.type,
        description: activity.description,
        createdAt: activity.createdAt
      }
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating test activity:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create test activity', details: error.message },
      { status: 500 }
    );
  }
}
