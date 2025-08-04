import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import Folder from '@/models/Folder';

// DELETE /api/folders/[id] - Delete a folder
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

    // Prevent deleting unfiled folder
    if (id === 'unfiled') {
      return NextResponse.json(
        { error: 'Cannot delete the Unfiled folder' },
        { status: 400 }
      );
    }

    // Find the folder to delete
    const folder = await Folder.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // When deleting a folder, remove the folder field from all notes in that folder
    await Note.updateMany(
      {
        userId: session.user.id,
        folder: folder.name,
        deleted: false
      },
      {
        $unset: { folder: "" } // Remove folder field - notes become unorganized
      }
    );

    // Delete the folder
    await Folder.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Folder deleted successfully',
      deletedFolder: {
        id: folder._id.toString(),
        name: folder.name
      }
    });

  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}

// PUT /api/folders/[id] - Update a folder
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
    const { name, description, color, icon } = await request.json();

    // Prevent updating unfiled folder
    if (id === 'unfiled') {
      return NextResponse.json(
        { error: 'Cannot update the Unfiled folder' },
        { status: 400 }
      );
    }

    // Validate folder name
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Folder name cannot be more than 100 characters' },
        { status: 400 }
      );
    }

    const folderName = name.trim();

    // Find the folder to update
    const folder = await Folder.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Prevent updating unfiled folder by name
    if (folder.name === 'Unfiled') {
      return NextResponse.json(
        { error: 'Cannot update the Unfiled folder' },
        { status: 400 }
      );
    }

    // Check if new name already exists (if name is being changed)
    if (folder.name !== folderName) {
      const existingFolder = await Folder.findOne({
        userId: session.user.id,
        name: folderName,
        _id: { $ne: id }
      });

      if (existingFolder) {
        return NextResponse.json(
          { error: 'Folder with this name already exists' },
          { status: 409 }
        );
      }

      // Update notes that reference the old folder name
      await Note.updateMany(
        {
          userId: session.user.id,
          folder: folder.name,
          deleted: false
        },
        {
          $set: { folder: folderName }
        }
      );
    }

    // Update the folder
    const updatedFolder = await Folder.findByIdAndUpdate(
      id,
      {
        name: folderName,
        description: description || folder.description,
        color: color || folder.color,
        icon: icon || folder.icon
      },
      { new: true }
    );

    // Get note counts
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

    return NextResponse.json({
      message: 'Folder updated successfully',
      folder: {
        id: updatedFolder._id.toString(),
        name: updatedFolder.name,
        description: updatedFolder.description,
        color: updatedFolder.color,
        icon: updatedFolder.icon,
        count: noteCount,
        starred: starredCount,
        lastUpdated: updatedFolder.updatedAt,
        isDefault: false
      }
    });

  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}
