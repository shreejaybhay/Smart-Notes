import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

// GET /api/notes/starred - Get all starred notes
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
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Get starred notes
    const notes = await Note.find({
      userId: session.user.id,
      starred: true,
      deleted: false
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title content folder tags starred createdAt updatedAt wordCount readingTime excerpt');

    // Get total count
    const total = await Note.countDocuments({
      userId: session.user.id,
      starred: true,
      deleted: false
    });

    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch starred notes' },
      { status: 500 }
    );
  }
}
