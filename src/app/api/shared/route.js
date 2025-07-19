import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import User from '@/models/User';

// GET /api/shared - Get all shared items for the authenticated user
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
    const type = searchParams.get('type'); // 'shared-by-me' or 'shared-with-me'
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    let notes = [];

    if (type === 'shared-by-me') {
      // Notes owned by user that have collaborators
      notes = await Note.find({
        userId: session.user.id,
        deleted: false,
        'collaborators.0': { $exists: true } // Has at least one collaborator
      })
        .populate('userId', 'firstName lastName email image')
        .populate('collaborators.userId', 'firstName lastName email image')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title content folder starred createdAt updatedAt collaborators userId isPublic');
    } else if (type === 'shared-with-me') {
      // Notes where user is a collaborator (shared with me)
      notes = await Note.find({
        deleted: false,
        'collaborators.userId': session.user.id
      })
        .populate('userId', 'firstName lastName email image')
        .populate('collaborators.userId', 'firstName lastName email image')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title content folder starred createdAt updatedAt collaborators userId isPublic');
    } else {
      // Get both: notes I own that are shared AND notes shared with me
      const [ownedSharedNotes, collaboratorNotes] = await Promise.all([
        // Notes I own that have collaborators
        Note.find({
          userId: session.user.id,
          deleted: false,
          'collaborators.0': { $exists: true }
        })
          .populate('userId', 'firstName lastName email image')
          .populate('collaborators.userId', 'firstName lastName email image')
          .sort({ updatedAt: -1 })
          .select('title content folder starred createdAt updatedAt collaborators userId isPublic'),
        
        // Notes where I'm a collaborator
        Note.find({
          deleted: false,
          'collaborators.userId': session.user.id
        })
          .populate('userId', 'firstName lastName email image')
          .populate('collaborators.userId', 'firstName lastName email image')
          .sort({ updatedAt: -1 })
          .select('title content folder starred createdAt updatedAt collaborators userId isPublic')
      ]);

      // Combine and sort by updatedAt
      notes = [...ownedSharedNotes, ...collaboratorNotes]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(skip, skip + limit);
    }

    // Transform the data for frontend
    const transformedNotes = notes.map(note => {
      const noteObj = note.toObject();
      
      // Determine user's permission for this note
      let userPermission = 'owner';
      if (noteObj.userId._id.toString() !== session.user.id) {
        const userCollab = noteObj.collaborators.find(
          collab => collab.userId._id.toString() === session.user.id
        );
        userPermission = userCollab ? userCollab.permission : 'viewer';
      }

      return {
        id: noteObj._id,
        name: noteObj.title,
        type: 'note',
        owner: {
          id: noteObj.userId._id,
          name: `${noteObj.userId.firstName} ${noteObj.userId.lastName}`,
          email: noteObj.userId.email,
          avatar: noteObj.userId.image
        },
        sharedWith: noteObj.collaborators.map(collab => ({
          id: collab.userId._id,
          name: `${collab.userId.firstName} ${collab.userId.lastName}`,
          email: collab.userId.email,
          avatar: collab.userId.image,
          permission: collab.permission,
          addedAt: collab.addedAt
        })),
        permission: userPermission,
        folder: noteObj.folder,
        starred: noteObj.starred,
        isPublic: noteObj.isPublic,
        createdAt: noteObj.createdAt,
        updatedAt: noteObj.updatedAt
      };
    });

    // Get total count based on type
    let total;
    if (type === 'shared-by-me') {
      total = await Note.countDocuments({
        userId: session.user.id,
        deleted: false,
        'collaborators.0': { $exists: true }
      });
    } else if (type === 'shared-with-me') {
      total = await Note.countDocuments({
        deleted: false,
        'collaborators.userId': session.user.id
      });
    } else {
      const [ownedCount, collabCount] = await Promise.all([
        Note.countDocuments({
          userId: session.user.id,
          deleted: false,
          'collaborators.0': { $exists: true }
        }),
        Note.countDocuments({
          deleted: false,
          'collaborators.userId': session.user.id
        })
      ]);
      total = ownedCount + collabCount;
    }

    return NextResponse.json({
      items: transformedNotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total,
        sharedByMe: await Note.countDocuments({
          userId: session.user.id,
          deleted: false,
          'collaborators.0': { $exists: true }
        }),
        sharedWithMe: await Note.countDocuments({
          deleted: false,
          'collaborators.userId': session.user.id
        })
      }
    });

  } catch (error) {
    console.error('Error fetching shared items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared items' },
      { status: 500 }
    );
  }
}

// POST /api/shared - Share a note with users
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
    const { noteId, emails, permission = 'viewer' } = body;

    // Validation
    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'At least one email is required' },
        { status: 400 }
      );
    }

    if (!['viewer', 'editor'].includes(permission)) {
      return NextResponse.json(
        { error: 'Invalid permission level' },
        { status: 400 }
      );
    }

    // Find the note
    const note = await Note.findById(noteId);
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Check if user owns the note or has editor permission
    if (note.userId.toString() !== session.user.id) {
      const userCollab = note.collaborators.find(
        collab => collab.userId.toString() === session.user.id
      );
      if (!userCollab || userCollab.permission !== 'editor') {
        return NextResponse.json(
          { error: 'Insufficient permissions to share this note' },
          { status: 403 }
        );
      }
    }

    // Find users by email
    const users = await User.find({ 
      email: { $in: emails.map(email => email.toLowerCase()) } 
    }).select('_id firstName lastName email');

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No users found with the provided email addresses' },
        { status: 404 }
      );
    }

    // Add collaborators
    const addedUsers = [];
    const existingUsers = [];

    for (const user of users) {
      // Don't add the owner as a collaborator
      if (user._id.toString() === note.userId.toString()) {
        continue;
      }

      const existingCollab = note.collaborators.find(
        collab => collab.userId.toString() === user._id.toString()
      );

      if (existingCollab) {
        // Update existing collaborator's permission
        existingCollab.permission = permission;
        existingUsers.push({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          permission: permission
        });
      } else {
        // Add new collaborator
        note.collaborators.push({
          userId: user._id,
          permission: permission,
          addedAt: new Date()
        });
        addedUsers.push({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          permission: permission
        });
      }
    }

    await note.save();

    // TODO: Send email notifications to new collaborators
    // This would be implemented with your email service

    return NextResponse.json({
      message: 'Note shared successfully',
      addedUsers,
      existingUsers,
      notFoundEmails: emails.filter(email => 
        !users.some(user => user.email.toLowerCase() === email.toLowerCase())
      )
    });

  } catch (error) {
    console.error('Error sharing note:', error);
    return NextResponse.json(
      { error: 'Failed to share note' },
      { status: 500 }
    );
  }
}