import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import Team from '@/models/Team';

// POST /api/teams/[id]/activities/cleanup - Clean up duplicate activities
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

    const { id: teamId } = await params;

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

    console.log('Starting activity cleanup for team:', teamId);

    // Find all note_edited activities for this team
    const editActivities = await Activity.find({
      teamId,
      type: 'note_edited'
    }).sort({ createdAt: -1 });

    console.log('Found', editActivities.length, 'edit activities');

    // Group activities by note and user
    const activityGroups = {};

    editActivities.forEach(activity => {
      const key = `${activity.resourceId}_${activity.userId}`;
      if (!activityGroups[key]) {
        activityGroups[key] = [];
      }
      activityGroups[key].push(activity);
    });

    let deletedCount = 0;

    // For each group, keep only the most recent activity and delete the rest
    for (const [key, activities] of Object.entries(activityGroups)) {
      if (activities.length > 1) {
        // Sort by creation date (newest first)
        activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Keep the first (newest) activity, delete the rest
        const toDelete = activities.slice(1);

        for (const activity of toDelete) {
          await Activity.findByIdAndDelete(activity._id);
          deletedCount++;
        }

        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Cleaned up ${toDelete.length} duplicate activities for ${key}`);
        }
      }
    }

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Activity cleanup completed. Deleted', deletedCount, 'duplicate activities');
    }

    return NextResponse.json({
      message: 'Activity cleanup completed successfully',
      deletedCount,
      totalGroups: Object.keys(activityGroups).length
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error cleaning up activities:', error);
    }
    return NextResponse.json(
      { error: 'Failed to cleanup activities' },
      { status: 500 }
    );
  }
}
