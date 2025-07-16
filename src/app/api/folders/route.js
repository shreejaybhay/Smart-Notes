import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import Folder from '@/models/Folder';

// GET /api/folders - Get all folders with note counts
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

    // Get real folders from database (including subfolders)
    const realFolders = await Folder.find({
      userId: session.user.id,
      isArchived: false
    }).populate('parentFolder').sort({ createdAt: -1 });

    // Get note counts and notes for each folder
    const foldersWithStats = await Promise.all(
      realFolders.map(async (folder) => {
        const noteCount = await Note.countDocuments({
          userId: session.user.id,
          folder: folder.name,
          deleted: false
        });

        const starredCount = await Note.countDocuments({
          userId: session.user.id,
          folder: folder.name,
          starred: true,
          deleted: false
        });

        // Get the actual notes in this folder (limit to recent 10)
        const folderNotes = await Note.find({
          userId: session.user.id,
          folder: folder.name,
          deleted: false
        })
          .sort({ updatedAt: -1 })
          .limit(10)
          .select('_id title updatedAt starred');

        return {
          ...folder.toObject(),
          count: noteCount,
          starred: starredCount,
          notes: folderNotes.map(note => ({
            id: note._id.toString(),
            title: note.title || 'Untitled',
            url: `/dashboard/notes/${note._id}`,
            starred: note.starred || false,
            updatedAt: note.updatedAt
          }))
        };
      })
    );

    const allFolders = [...foldersWithStats];

    // Transform for API response
    const folders = allFolders.map(folder => ({
      id: folder._id?.toString() || folder.id, // Include database ID
      name: folder.name,
      count: folder.count || 0,
      starred: folder.starred || 0,
      lastUpdated: folder.lastUpdated || folder.updatedAt,
      isDefault: folder.isDefault || false,
      color: folder.color || 'primary',
      icon: folder.icon || 'folder',
      parentFolder: folder.parentFolder?._id?.toString() || folder.parentFolder || null,
      notes: folder.notes || [] // Include the notes in this folder
    }));

    return NextResponse.json({
      folders,
      total: folders.length
    });

  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

// POST /api/folders - Create a new folder (by moving notes to it)
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

    const { name, noteIds, description, color, icon, parentFolder } = await request.json();

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Folder name cannot be more than 100 characters' },
        { status: 400 }
      );
    }

    const folderName = name.trim();

    // Check if folder already exists
    const existingFolder = await Folder.findOne({
      userId: session.user.id,
      name: folderName
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: 'Folder already exists' },
        { status: 409 }
      );
    }

    // Create new folder in database
    const newFolder = new Folder({
      name: folderName,
      userId: session.user.id,
      description: description || '',
      color: color || 'primary',
      icon: icon || 'folder',
      parentFolder: parentFolder || null // Support for subfolders
    });

    await newFolder.save();

    // If noteIds provided, move those notes to the new folder
    if (noteIds && Array.isArray(noteIds) && noteIds.length > 0) {
      await Note.updateMany(
        {
          _id: { $in: noteIds },
          userId: session.user.id,
          deleted: false
        },
        {
          $set: { folder: folderName }
        }
      );
    }

    // Get the note count for the new folder
    const noteCount = await Note.countDocuments({
      userId: session.user.id,
      folder: folderName,
      deleted: false
    });

    const starredCount = await Note.countDocuments({
      userId: session.user.id,
      folder: folderName,
      starred: true,
      deleted: false
    });

    // Return the created folder info
    const folder = {
      id: newFolder._id.toString(),
      name: newFolder.name,
      count: noteCount,
      starred: starredCount,
      lastUpdated: newFolder.updatedAt,
      isDefault: false,
      color: newFolder.color,
      icon: newFolder.icon
    };

    return NextResponse.json({
      message: 'Folder created successfully',
      folder
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}


