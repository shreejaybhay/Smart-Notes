import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import mongoose from 'mongoose';

// POST /api/notes/[id]/star - Toggle star status of a note
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

    // Toggle starred status
    note.starred = !note.starred;
    await note.save();

    return NextResponse.json({
      message: note.starred ? 'Note starred' : 'Note unstarred',
      starred: note.starred
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update star status' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id]/star - Set specific star status
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
    const { starred } = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    if (typeof starred !== 'boolean') {
      return NextResponse.json(
        { error: 'Starred must be a boolean value' },
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

    // Set starred status
    note.starred = starred;
    await note.save();

    return NextResponse.json({
      message: starred ? 'Note starred' : 'Note unstarred',
      starred: note.starred
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update star status' },
      { status: 500 }
    );
  }
}
