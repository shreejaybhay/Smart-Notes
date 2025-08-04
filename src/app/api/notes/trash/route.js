import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import Activity from '@/models/Activity';

// GET /api/notes/trash - Get all deleted notes for the current user
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

    // Get all deleted notes for this user
    const deletedNotes = await Note.find({
      userId: session.user.id,
      deleted: true
    }).sort({ deletedAt: -1 }); // Most recently deleted first

    return NextResponse.json({
      notes: deletedNotes,
      count: deletedNotes.length
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching deleted notes:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch deleted notes' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/trash - Empty trash (permanently delete all deleted notes)
export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // First, get all deleted notes to log activities for team notes
    const deletedNotes = await Note.find({
      userId: session.user.id,
      deleted: true
    });

    // Log activities for team notes before deleting them
    const teamNotesToDelete = deletedNotes.filter(note => note.isTeamNote && note.teamId);

    for (const note of teamNotesToDelete) {
      try {
        await Activity.createActivity({
          teamId: note.teamId,
          userId: session.user.id,
          type: 'note_permanently_deleted',
          description: `Permanently deleted team note "${note.title}" (bulk trash empty)`,
          resourceId: note._id,
          resourceType: 'note',
          metadata: {
            noteTitle: note.title,
            noteId: note._id.toString(),
            deletionType: 'bulk_permanent'
          }
        });
        console.log(`Bulk permanent deletion activity logged for note: ${note.title}`);
      } catch (activityError) {
        console.error('Error logging bulk permanent deletion activity:', activityError);
        // Continue with other notes even if one fails
      }
    }

    // Permanently delete all notes that are marked as deleted
    const result = await Note.deleteMany({
      userId: session.user.id,
      deleted: true
    });

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Bulk permanent deletion completed. Deleted ${result.deletedCount} notes, logged ${teamNotesToDelete.length} team activities`);
    }

    return NextResponse.json({
      message: `Permanently deleted ${result.deletedCount} notes`,
      deletedCount: result.deletedCount,
      teamNotesLogged: teamNotesToDelete.length
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error emptying trash:', error);
    }
    return NextResponse.json(
      { error: 'Failed to empty trash' },
      { status: 500 }
    );
  }
}
