import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

// GET /api/shared/search - Search user's notes and folders for sharing
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
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit')) || 20;

    // Build search query for user's notes
    let searchQuery = {
      userId: session.user.id,
      deleted: false
    };

    // Add text search if query provided
    if (query.trim()) {
      const searchRegex = new RegExp(query.trim(), 'i');
      searchQuery.$or = [
        { title: searchRegex },
        { folder: searchRegex }
      ];
    }

    // Get notes
    const notes = await Note.find(searchQuery)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('title folder createdAt updatedAt collaborators');

    // Get unique folders
    const folders = await Note.aggregate([
      { 
        $match: { 
          userId: session.user.id, 
          deleted: false,
          folder: { $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$folder',
          count: { $sum: 1 },
          lastModified: { $max: '$updatedAt' }
        }
      },
      {
        $match: query.trim() ? {
          _id: { $regex: query.trim(), $options: 'i' }
        } : {}
      },
      { $sort: { lastModified: -1 } },
      { $limit: 10 }
    ]);

    // Transform data for frontend
    const transformedNotes = notes.map(note => ({
      id: note._id,
      name: note.title,
      type: 'note',
      folder: note.folder,
      lastModified: getRelativeTime(note.updatedAt),
      isShared: note.collaborators && note.collaborators.length > 0,
      collaboratorCount: note.collaborators ? note.collaborators.length : 0
    }));

    const transformedFolders = folders.map(folder => ({
      id: `folder_${folder._id}`,
      name: folder._id,
      type: 'folder',
      folder: null,
      lastModified: getRelativeTime(folder.lastModified),
      noteCount: folder.count
    }));

    // Combine and sort results
    const allResults = [...transformedFolders, ...transformedNotes]
      .sort((a, b) => {
        // Prioritize exact matches
        if (query.trim()) {
          const aExact = a.name.toLowerCase() === query.toLowerCase();
          const bExact = b.name.toLowerCase() === query.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
        }
        return 0;
      });

    return NextResponse.json({
      results: allResults.slice(0, limit),
      total: allResults.length,
      query: query.trim()
    });

  } catch (error) {
    console.error('Error searching shareable items:', error);
    return NextResponse.json(
      { error: 'Failed to search items' },
      { status: 500 }
    );
  }
}

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}