import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

// PUT /api/notes/[id]/restore - Restore a deleted note
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Find the deleted note
    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Check if user owns this note
    if (note.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if note is actually deleted
    if (!note.deleted) {
      return NextResponse.json(
        { error: 'Note is not in trash' },
        { status: 400 }
      );
    }

    // Restore the note
    note.deleted = false;
    note.deletedAt = null;
    note.updatedAt = new Date();
    await note.save();

    // Log activity if this is a team note being restored
    if (note.isTeamNote && note.teamId) {
      try {
        await Activity.createActivity({
          teamId: note.teamId,
          userId: session.user.id,
          type: 'note_restored',
          description: `Restored team note "${note.title}" from trash`,
          resourceId: note._id,
          resourceType: 'note',
          metadata: {
            noteTitle: note.title,
            noteId: note._id.toString(),
            restoredFrom: 'trash'
          }
        });
        console.log('Note restoration activity logged successfully');
      } catch (activityError) {
        console.error('Error logging note restoration activity:', activityError);
        // Don't fail the restoration if activity logging fails
      }
    }

    return NextResponse.json({
      message: 'Note restored successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        folder: note.folder,
        deleted: note.deleted,
        updatedAt: note.updatedAt
      }
    });

  } catch (error) {
    console.error('Error restoring note:', error);
    return NextResponse.json(
      { error: 'Failed to restore note' },
      { status: 500 }
    );
  }
}
