import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

// GET /api/debug/notes - Debug endpoint to check all notes in database
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

    // Get ALL notes for this user (including deleted ones)
    const allNotes = await Note.find({
      userId: session.user.id
    }).select('title deleted deletedAt createdAt updatedAt').sort({ createdAt: -1 });

    // Get only non-deleted notes
    const activeNotes = await Note.find({
      userId: session.user.id,
      deleted: false
    }).select('title deleted deletedAt createdAt updatedAt').sort({ createdAt: -1 });

    // Get only deleted notes
    const deletedNotes = await Note.find({
      userId: session.user.id,
      deleted: true
    }).select('title deleted deletedAt createdAt updatedAt').sort({ createdAt: -1 });

    return NextResponse.json({
      summary: {
        total: allNotes.length,
        active: activeNotes.length,
        deleted: deletedNotes.length
      },
      allNotes,
      activeNotes,
      deletedNotes
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in debug notes:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch debug info' },
      { status: 500 }
    );
  }
}
