import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

// PATCH /api/shared/[id] - Update sharing permissions
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { action, userId, permission } = body;

    // Find the note
    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Check if user owns the note or has editor permission
    const isOwner = note.userId.toString() === session.user.id;
    const userCollab = note.collaborators.find(
      collab => collab.userId.toString() === session.user.id
    );
    const hasEditorAccess = userCollab && userCollab.permission === 'editor';

    if (!isOwner && !hasEditorAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (action === 'update-permission') {
      // Update collaborator permission
      if (!userId || !permission) {
        return NextResponse.json(
          { error: 'User ID and permission are required' },
          { status: 400 }
        );
      }

      if (!['viewer', 'editor'].includes(permission)) {
        return NextResponse.json(
          { error: 'Invalid permission level' },
          { status: 400 }
        );
      }

      const collaborator = note.collaborators.find(
        collab => collab.userId.toString() === userId
      );

      if (!collaborator) {
        return NextResponse.json(
          { error: 'Collaborator not found' },
          { status: 404 }
        );
      }

      collaborator.permission = permission;
      await note.save();

      return NextResponse.json({
        message: 'Permission updated successfully',
        collaborator: {
          userId: collaborator.userId,
          permission: collaborator.permission
        }
      });

    } else if (action === 'remove-collaborator') {
      // Remove collaborator
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      const collaboratorIndex = note.collaborators.findIndex(
        collab => collab.userId.toString() === userId
      );

      if (collaboratorIndex === -1) {
        return NextResponse.json(
          { error: 'Collaborator not found' },
          { status: 404 }
        );
      }

      note.collaborators.splice(collaboratorIndex, 1);
      await note.save();

      return NextResponse.json({
        message: 'Collaborator removed successfully'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating shared note:', error);
    return NextResponse.json(
      { error: 'Failed to update shared note' },
      { status: 500 }
    );
  }
}

// DELETE /api/shared/[id] - Remove user from shared note or stop sharing entirely
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

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'leave' or 'stop-sharing'

    // Find the note
    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    const isOwner = note.userId.toString() === session.user.id;

    if (action === 'leave') {
      // User wants to leave the shared note (remove themselves)
      if (isOwner) {
        return NextResponse.json(
          { error: 'Owner cannot leave their own note' },
          { status: 400 }
        );
      }

      const collaboratorIndex = note.collaborators.findIndex(
        collab => collab.userId.toString() === session.user.id
      );

      if (collaboratorIndex === -1) {
        return NextResponse.json(
          { error: 'You are not a collaborator on this note' },
          { status: 404 }
        );
      }

      note.collaborators.splice(collaboratorIndex, 1);
      await note.save();

      return NextResponse.json({
        message: 'Successfully left the shared note'
      });

    } else if (action === 'stop-sharing') {
      // Owner wants to stop sharing entirely (remove all collaborators)
      if (!isOwner) {
        return NextResponse.json(
          { error: 'Only the owner can stop sharing' },
          { status: 403 }
        );
      }

      note.collaborators = [];
      note.isPublic = false;
      note.shareToken = undefined;
      await note.save();

      return NextResponse.json({
        message: 'Stopped sharing note successfully'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "leave" or "stop-sharing"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error deleting shared note:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}