import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Note from '@/models/Note';
import mongoose from 'mongoose';

// GET /api/teams/[id]/notes - Get notes for a specific team
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
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Find team and check access
    const team = await Team.findById(id);

    if (!team || !team.isActive || team.isArchived) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this team
    if (!team.canUserAccess(session.user.id)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search');
    const starred = searchParams.get('starred');
    const skip = (page - 1) * limit;

    // Build query for team notes
    let query = {
      teamId: id,
      deleted: false
    };

    // Add search filter
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } }
      ];
    }

    // Add starred filter
    if (starred === 'true') {
      query.starred = true;
    }

    // Add folder filter
    if (folder) {
      if (folder === 'all') {
        // No additional filter needed - show all notes
      } else if (folder === 'unfiled' || folder === 'null') {
        // Show notes without a folder
        query.$or = [
          { folder: { $exists: false } },
          { folder: null },
          { folder: '' }
        ];
      } else {
        // Show notes in specific folder
        query.folder = folder;
      }
    }

    // Get notes with pagination
    const notes = await Note.find(query)
      .populate('userId', 'firstName lastName email avatar')
      .select('title content folder tags starred createdAt updatedAt wordCount readingTime')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Note.countDocuments(query);

    // Transform notes for response
    const transformedNotes = notes.map(note => ({
      id: note._id,
      title: note.title,
      content: note.content,
      excerpt: note.excerpt,
      folder: note.folder,
      tags: note.tags,
      starred: note.starred,
      wordCount: note.wordCount,
      readingTime: note.readingTime,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      author: {
        id: note.userId._id,
        name: `${note.userId.firstName} ${note.userId.lastName}`,
        email: note.userId.email,
        avatar: note.userId.avatar
      }
    }));

    return NextResponse.json({
      notes: transformedNotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching team notes:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch team notes',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/teams/[id]/notes - Create a new note for the team
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
    const body = await request.json();
    const { title, content, folder, tags, starred } = body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Find team and check access
    const team = await Team.findById(id);

    if (!team || !team.isActive || team.isArchived) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user can create notes in this team
    const userMember = team.getMember(session.user.id);
    const isOwner = team.ownerId.toString() === session.user.id;

    if (!isOwner && (!userMember || !userMember.permissions.canCreateNotes)) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to create notes in this team.' },
        { status: 403 }
      );
    }

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

    // Create new team note
    const note = new Note({
      title: title.trim(),
      content: content || '',
      userId: session.user.id,
      teamId: id, // Associate with team
      isTeamNote: true, // Mark as team note
      folder: folder?.trim() || null,
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()).map(tag => tag.trim()) : [],
      starred: Boolean(starred)
    });

    await note.save();

    // Update team stats
    await Team.findByIdAndUpdate(id, {
      $inc: { 'stats.totalNotes': 1 },
      $set: { 'stats.lastActivity': new Date() }
    });

    // Return the created note
    const createdNote = await Note.findById(note._id)
      .populate('userId', 'firstName lastName email avatar')
      .select('title content folder tags starred createdAt updatedAt wordCount readingTime');

    return NextResponse.json({
      message: 'Team note created successfully',
      note: {
        id: createdNote._id,
        title: createdNote.title,
        content: createdNote.content,
        excerpt: createdNote.excerpt,
        folder: createdNote.folder,
        tags: createdNote.tags,
        starred: createdNote.starred,
        wordCount: createdNote.wordCount,
        readingTime: createdNote.readingTime,
        createdAt: createdNote.createdAt,
        updatedAt: createdNote.updatedAt,
        author: {
          id: createdNote.userId._id,
          name: `${createdNote.userId.firstName} ${createdNote.userId.lastName}`,
          email: createdNote.userId.email,
          avatar: createdNote.userId.avatar
        }
      }
    }, { status: 201 });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating team note:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create team note' },
      { status: 500 }
    );
  }
}
