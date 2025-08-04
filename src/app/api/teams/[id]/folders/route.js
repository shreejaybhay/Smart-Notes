import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Folder from '@/models/Folder';
import Note from '@/models/Note';
import Activity from '@/models/Activity';

// GET /api/teams/[id]/folders - Get all folders for a team
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

    const { id: teamId } = await params;

    // Check if user has access to this team
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is a member of this team
    const userMember = team.getMember(session.user.id);
    if (!userMember) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get team folders with note counts and populate creator info
    const folders = await Folder.find({
      teamId,
      isTeamFolder: true,
      isArchived: false
    }).populate('createdBy', 'firstName lastName email').sort({ order: 1, createdAt: -1 });

    // Calculate note counts for each folder
    const foldersWithStats = await Promise.all(
      folders.map(async (folder) => {
        const noteCount = await Note.countDocuments({
          teamId,
          folder: folder.name,
          deleted: false,
          isTeamNote: true
        });

        const starredCount = await Note.countDocuments({
          teamId,
          folder: folder.name,
          starred: true,
          deleted: false,
          isTeamNote: true
        });

        return {
          id: folder._id.toString(),
          name: folder.name,
          description: folder.description,
          color: folder.color,
          icon: folder.icon,
          count: noteCount,
          starred: starredCount,
          lastUpdated: folder.updatedAt,
          createdAt: folder.createdAt,
          createdBy: folder.createdBy,
          isDefault: false,
          isTeamFolder: true
        };
      })
    );

    // Return only user-created folders (no virtual folders)
    return NextResponse.json({
      folders: foldersWithStats
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch team folders' },
      { status: 500 }
    );
  }
}

// POST /api/teams/[id]/folders - Create a new team folder
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

    const { id: teamId } = await params;
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
    if (!userMember || (userMember.role === 'viewer' && !userMember.permissions?.canCreateFolders)) {
      return NextResponse.json(
        { error: 'Access denied - insufficient permissions' },
        { status: 403 }
      );
    }

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

    // Check if folder already exists in this team
    const existingFolder = await Folder.findOne({
      teamId,
      name: folderName,
      isTeamFolder: true
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: 'Folder already exists in this team' },
        { status: 409 }
      );
    }

    // Create new team folder
    const newFolder = new Folder({
      name: folderName,
      // Don't set userId for team folders to avoid index conflicts
      teamId,
      isTeamFolder: true,
      description: description || '',
      color: color || 'primary', // Use theme color instead of hex
      icon: icon || 'folder',
      // Track creator in metadata instead
      createdBy: session.user.id
    });

    await newFolder.save();

    // Log activity
    try {
      await Activity.createActivity({
        teamId,
        userId: session.user.id,
        type: 'folder_created',
        description: `Created team folder "${folderName}"`,
        resourceId: newFolder._id,
        resourceType: 'folder',
        metadata: {
          folderName,
          folderId: newFolder._id.toString()
        }
      });
      console.log('Folder creation activity logged successfully');
    } catch (activityError) {
      console.error('Error logging folder creation activity:', activityError);
    }

    // Get note count (should be 0 for new folder)
    const noteCount = await Note.countDocuments({
      teamId,
      folder: folderName,
      deleted: false,
      isTeamNote: true
    });

    return NextResponse.json({
      message: 'Team folder created successfully',
      folder: {
        id: newFolder._id.toString(),
        name: newFolder.name,
        description: newFolder.description,
        color: newFolder.color,
        icon: newFolder.icon,
        count: noteCount,
        starred: 0,
        lastUpdated: newFolder.updatedAt,
        isDefault: false,
        isTeamFolder: true
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating team folder:', error);
    return NextResponse.json(
      { error: 'Failed to create team folder' },
      { status: 500 }
    );
  }
}
