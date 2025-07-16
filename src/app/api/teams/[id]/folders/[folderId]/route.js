import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Folder from '@/models/Folder';
import Note from '@/models/Note';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

// PUT /api/teams/[id]/folders/[folderId] - Update a team folder
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

    const { id: teamId, folderId } = await params;
    const { name, description, color, icon } = await request.json();

    // Check if user has access to this team
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is a member with edit permissions
    const userMember = team.getMember(session.user.id);
    if (!userMember || (userMember.role === 'viewer' && !userMember.permissions?.canEditFolders)) {
      return NextResponse.json(
        { error: 'Access denied - insufficient permissions' },
        { status: 403 }
      );
    }

    // Find the folder
    const folder = await Folder.findOne({
      _id: folderId,
      teamId,
      isTeamFolder: true
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Team folder not found' },
        { status: 404 }
      );
    }

    // Validate folder name
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

    // Check if new name already exists (if name is being changed)
    if (folder.name !== folderName) {
      const existingFolder = await Folder.findOne({
        teamId,
        name: folderName,
        isTeamFolder: true,
        _id: { $ne: folderId }
      });

      if (existingFolder) {
        return NextResponse.json(
          { error: 'Folder with this name already exists in this team' },
          { status: 409 }
        );
      }

      // Update notes that reference the old folder name
      await Note.updateMany(
        {
          teamId,
          folder: folder.name,
          deleted: false,
          isTeamNote: true
        },
        {
          $set: { folder: folderName }
        }
      );
    }

    // Update the folder
    const updatedFolder = await Folder.findByIdAndUpdate(
      folderId,
      {
        name: folderName,
        description: description || folder.description,
        color: color || folder.color,
        icon: icon || folder.icon
      },
      { new: true }
    );

    // Log activity
    try {
      await Activity.createActivity({
        teamId,
        userId: session.user.id,
        type: 'folder_renamed',
        description: `Renamed team folder to "${folderName}"`,
        resourceId: updatedFolder._id,
        resourceType: 'folder',
        metadata: {
          newName: folderName,
          oldName: folder.name,
          folderId: updatedFolder._id.toString()
        }
      });
      console.log('Folder update activity logged successfully');
    } catch (activityError) {
      console.error('Error logging folder update activity:', activityError);
    }

    // Get note counts
    const noteCount = await Note.countDocuments({
      teamId,
      folder: folderName,
      deleted: false,
      isTeamNote: true
    });

    const starredCount = await Note.countDocuments({
      teamId,
      folder: folderName,
      starred: true,
      deleted: false,
      isTeamNote: true
    });

    return NextResponse.json({
      message: 'Team folder updated successfully',
      folder: {
        id: updatedFolder._id.toString(),
        name: updatedFolder.name,
        description: updatedFolder.description,
        color: updatedFolder.color,
        icon: updatedFolder.icon,
        count: noteCount,
        starred: starredCount,
        lastUpdated: updatedFolder.updatedAt,
        isDefault: false,
        isTeamFolder: true
      }
    });

  } catch (error) {
    console.error('Error updating team folder:', error);
    return NextResponse.json(
      { error: 'Failed to update team folder' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]/folders/[folderId] - Delete a team folder
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

    const { id: teamId, folderId } = await params;

    // Check if user has access to this team
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is a member with delete permissions
    const userMember = team.getMember(session.user.id);
    if (!userMember || (userMember.role === 'viewer' && !userMember.permissions?.canDeleteFolders)) {
      return NextResponse.json(
        { error: 'Access denied - insufficient permissions' },
        { status: 403 }
      );
    }

    // Find the folder to delete
    const folder = await Folder.findOne({
      _id: folderId,
      teamId,
      isTeamFolder: true
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Team folder not found' },
        { status: 404 }
      );
    }

    // When deleting a folder, remove the folder field from all notes in that folder
    await Note.updateMany(
      {
        teamId,
        folder: folder.name,
        deleted: false,
        isTeamNote: true
      },
      {
        $unset: { folder: "" } // Remove folder field - notes become unfiled
      }
    );

    // Delete the folder
    await Folder.findByIdAndDelete(folderId);

    // Log activity
    try {
      await Activity.createActivity({
        teamId,
        userId: session.user.id,
        type: 'folder_deleted',
        description: `Deleted team folder "${folder.name}"`,
        resourceId: folder._id,
        resourceType: 'folder',
        metadata: {
          folderName: folder.name,
          folderId: folder._id.toString()
        }
      });
      console.log('Folder deletion activity logged successfully');
    } catch (activityError) {
      console.error('Error logging folder deletion activity:', activityError);
    }

    return NextResponse.json({
      message: 'Team folder deleted successfully',
      deletedFolder: {
        id: folder._id.toString(),
        name: folder.name
      }
    });

  } catch (error) {
    console.error('Error deleting team folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete team folder' },
      { status: 500 }
    );
  }
}
