import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

// GET /api/notes - Get all notes for the authenticated user
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
    const folder = searchParams.get('folder');
    const starred = searchParams.get('starred');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {
      userId: session.user.id,
      deleted: false
    };

    // Filter by folder
    if (folder && folder !== 'all') {
      query.folder = folder;
    }

    // Filter by starred
    if (starred === 'true') {
      query.starred = true;
    }

    let notes;
    let total;

    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Get notes with pagination
    notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title content folder tags starred createdAt updatedAt wordCount readingTime excerpt');

    // Get total count for pagination
    total = await Note.countDocuments(query);

    // Get folder statistics
    const folderStats = await Note.aggregate([
      { $match: { userId: session.user.id, deleted: false } },
      { $group: { _id: '$folder', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent tags
    const recentTags = await Note.aggregate([
      { $match: { userId: session.user.id, deleted: false } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total,
        starred: await Note.countDocuments({
          userId: session.user.id,
          deleted: false,
          starred: true
        }),
        folders: folderStats,
        tags: recentTags.map(tag => tag._id)
      }
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { title, content, folder, tags, starred } = body;

    // Validation
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

    if (content && content.length > 50000) {
      return NextResponse.json(
        { error: 'Content cannot be more than 50,000 characters' },
        { status: 400 }
      );
    }

    // Create new note
    const note = new Note({
      title: title.trim(),
      content: content || '',
      userId: session.user.id,
      folder: folder?.trim() || null,
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()).map(tag => tag.trim()) : [],
      starred: Boolean(starred)
    });

    await note.save();

    // Return the created note
    const createdNote = await Note.findById(note._id)
      .select('title content folder tags starred createdAt updatedAt wordCount readingTime excerpt');

    return NextResponse.json({
      message: 'Note created successfully',
      note: createdNote
    }, { status: 201 });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating note:', error);
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
