import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Note from '@/models/Note';
import mongoose from 'mongoose';

// POST /api/teams/[id]/notes/create - Create a new team note
export async function POST(request, { params }) {
  try {
    console.log('Creating team note - Starting...');

    const session = await auth();
    console.log('Session:', session ? 'Found' : 'Not found');

    if (!session) {
      console.log('No session, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Connecting to database...');
    await connectDB();

    const { id } = await params;
    const { title, content, folderId } = await request.json();

    console.log('Team ID:', id);
    console.log('Request data:', { title, content, folderId });

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

    // Check if user can create notes (all active members should be able to)
    const member = team.members.find(member => {
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

    if (!member || !member.permissions.canCreateNotes) {
      return NextResponse.json(
        { error: 'You do not have permission to create notes in this team' },
        { status: 403 }
      );
    }

    // Create the team note
    const noteData = {
      title: title || 'Untitled Team Note',
      content: content || '',
      userId: session.user.id, // Required field
      authorId: session.user.id,
      isTeamNote: true,
      teamId: id,
      folder: folderId || null,
      tags: ['team-note', team.name.toLowerCase().replace(/\s+/g, '-')],
      collaborators: team.members
        .filter(m => m.status === 'active')
        .map(m => ({
          userId: typeof m.userId === 'object' && m.userId._id ? m.userId._id : m.userId,
          permission: m.role === 'owner' ? 'owner' : (m.permissions.canEditNotes ? 'editor' : 'viewer')
        })),
      teamMetadata: {
        teamName: team.name,
        createdByRole: member.role
      }
    };

    console.log('Creating note with data:', noteData);

    const note = new Note(noteData);
    console.log('Note instance created, saving...');

    await note.save();
    console.log('Note saved successfully:', note._id);

    // Populate the note with author and collaborator details
    await note.populate('authorId', 'firstName lastName email avatar');
    await note.populate('collaborators.userId', 'firstName lastName email avatar');

    // Update team stats
    team.stats.totalNotes = (team.stats.totalNotes || 0) + 1;
    await team.save();

    return NextResponse.json({
      message: 'Team note created successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        author: note.authorId,
        isTeamNote: note.isTeamNote,
        teamId: note.teamId,
        teamName: team.name,
        collaborators: note.collaborators,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    }, { status: 201 });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating team note:', error);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }

    return NextResponse.json(
      {
        error: 'Failed to create team note',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
