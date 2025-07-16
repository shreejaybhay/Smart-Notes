import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import Team from '@/models/Team';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';



// GET /api/notes/[id] - Get a specific note
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
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Find the note
    const note = await Note.findOne({
      _id: id,
      deleted: false
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this note
    let userTeamMember = null;

    // If this is a team note, get the user's team member info
    if (note.isTeamNote && note.teamId) {
      const team = await Team.findById(note.teamId);
      if (team) {
        userTeamMember = team.members.find(member => {
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
      }
    }

    if (!note.canUserAccess(session.user.id, 'viewer', userTeamMember)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update last viewed timestamp
    note.lastViewedAt = new Date();
    await note.save();

    return NextResponse.json({ note });

  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a specific note
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
    const { title, content, folder, tags, starred } = body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Find the note
    const note = await Note.findOne({
      _id: id,
      deleted: false
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Check if user has edit access
    let userTeamMember = null;

    // If this is a team note, get the user's team member info
    if (note.isTeamNote && note.teamId) {
      const team = await Team.findById(note.teamId);
      if (team) {
        userTeamMember = team.members.find(member => {
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
      }
    }

    // For team notes, check if user has edit permissions based on their team role
    if (note.isTeamNote && userTeamMember) {
      console.log('Team note edit check:', {
        userId: session.user.id,
        userRole: userTeamMember.role,
        canEditNotes: userTeamMember.permissions.canEditNotes,
        noteId: note._id
      });

      // Check team member permissions
      if (!userTeamMember.permissions.canEditNotes) {
        return NextResponse.json(
          {
            error: 'You do not have permission to edit this team note',
            userRole: userTeamMember.role,
            requiredPermission: 'canEditNotes'
          },
          { status: 403 }
        );
      }
    } else if (!note.canUserAccess(session.user.id, 'editor', userTeamMember)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Validation
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title is required' },
          { status: 400 }
        );
      }
      if (title.length > 200) {
        return NextResponse.json(
          { error: 'Title cannot be more than 200 characters' },
          { status: 400 }
        );
      }
      note.title = title.trim();
    }

    if (content !== undefined) {
      if (content.length > 50000) {
        return NextResponse.json(
          { error: 'Content cannot be more than 50,000 characters' },
          { status: 400 }
        );
      }
      note.content = content;
    }

    if (folder !== undefined) {
      note.folder = folder?.trim() || null;
    }

    if (tags !== undefined) {
      note.tags = Array.isArray(tags) ?
        tags.filter(tag => tag.trim()).map(tag => tag.trim()) : [];
    }

    if (starred !== undefined) {
      note.starred = Boolean(starred);
    }

    // Increment version
    note.version += 1;

    await note.save();

    // Log activity ONLY for manual saves (Ctrl+S) on team notes
    if (note.isTeamNote && note.teamId) {
      try {
        // Check if this is a manual save (Ctrl+S)
        const { searchParams } = new URL(request.url);
        const isManualSave = searchParams.get('manual') === 'true';

        if (isManualSave) {
          await Activity.createActivity({
            teamId: note.teamId,
            userId: session.user.id,
            type: 'note_edited',
            description: `Edited team note "${note.title}"`,
            resourceId: note._id,
            resourceType: 'note',
            metadata: {
              noteTitle: note.title,
              noteId: note._id.toString(),
              editType: 'manual'
            }
          });
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Manual save activity logged successfully');
          }
        } else {
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Skipping activity log - auto-save (only manual saves are logged)');
          }
        }
      } catch (activityError) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error logging note edit activity:', activityError);
        }
        // Don't fail the note update if activity logging fails
      }
    }

    // Return updated note
    const updatedNote = await Note.findById(note._id)
      .select('title content folder tags starred createdAt updatedAt wordCount readingTime excerpt version');

    return NextResponse.json({
      message: 'Note updated successfully',
      note: updatedNote
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating note:', error);
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// PATCH /api/notes/[id] - Partially update a specific note
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

    const { id } = await params;
    const body = await request.json();
    const { title, content, folder, tags, starred } = body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Find the note
    const note = await Note.findOne({
      _id: id,
      deleted: false
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this note
    if (!note.canUserAccess(session.user.id)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update only provided fields
    if (title !== undefined) {
      note.title = title.trim();
    }

    if (content !== undefined) {
      note.content = content;

      // Update word count and reading time
      const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
      note.wordCount = wordCount;
      note.readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
    }

    if (folder !== undefined) {
      note.folder = folder;
    }

    if (tags !== undefined) {
      note.tags = Array.isArray(tags) ? tags : [];
    }

    if (starred !== undefined) {
      note.starred = Boolean(starred);
    }

    // Increment version
    note.version += 1;

    await note.save();

    // Return updated note
    const updatedNote = await Note.findById(note._id)
      .select('title content folder tags starred createdAt updatedAt wordCount readingTime excerpt version');

    return NextResponse.json({
      message: 'Note updated successfully',
      note: updatedNote
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a specific note
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
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Find the note
    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Check if user owns this note (only owner can delete)
    if (note.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (permanent) {
      // Log activity if this is a team note being permanently deleted
      if (note.isTeamNote && note.teamId) {
        try {
          await Activity.createActivity({
            teamId: note.teamId,
            userId: session.user.id,
            type: 'note_permanently_deleted',
            description: `Permanently deleted team note "${note.title}"`,
            resourceId: note._id,
            resourceType: 'note',
            metadata: {
              noteTitle: note.title,
              noteId: note._id.toString(),
              deletionType: 'permanent'
            }
          });
          console.log('Permanent deletion activity logged successfully');
        } catch (activityError) {
          console.error('Error logging permanent deletion activity:', activityError);
          // Don't fail the deletion if activity logging fails
        }
      }

      // Permanent deletion
      await Note.findByIdAndDelete(id);
      return NextResponse.json({
        message: 'Note permanently deleted'
      });
    } else {
      // Soft deletion (move to trash)
      note.deleted = true;
      note.deletedAt = new Date();
      await note.save();

      // Log activity if this is a team note being moved to trash
      if (note.isTeamNote && note.teamId) {
        try {
          await Activity.createActivity({
            teamId: note.teamId,
            userId: session.user.id,
            type: 'note_deleted',
            description: `Moved team note "${note.title}" to trash`,
            resourceId: note._id,
            resourceType: 'note',
            metadata: {
              noteTitle: note.title,
              noteId: note._id.toString(),
              deletionType: 'soft'
            }
          });
          console.log('Soft deletion activity logged successfully');
        } catch (activityError) {
          console.error('Error logging soft deletion activity:', activityError);
          // Don't fail the deletion if activity logging fails
        }
      }

      return NextResponse.json({
        message: 'Note moved to trash'
      });
    }

  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
