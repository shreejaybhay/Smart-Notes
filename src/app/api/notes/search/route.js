import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

// GET /api/notes/search - Advanced search for notes
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
    const query = searchParams.get('q');
    const folder = searchParams.get('folder');
    const tags = searchParams.get('tags');
    const starred = searchParams.get('starred');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build search criteria
    let searchCriteria = {
      userId: session.user.id,
      deleted: false
    };

    // Text search
    const searchRegex = new RegExp(query.trim(), 'i');
    searchCriteria.$or = [
      { title: searchRegex },
      { content: searchRegex },
      { tags: { $in: [searchRegex] } }
    ];

    // Filter by folder
    if (folder && folder !== 'all') {
      searchCriteria.folder = folder;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      searchCriteria.tags = { $in: tagArray };
    }

    // Filter by starred
    if (starred === 'true') {
      searchCriteria.starred = true;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      searchCriteria.createdAt = {};
      if (dateFrom) {
        searchCriteria.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        searchCriteria.createdAt.$lte = new Date(dateTo);
      }
    }

    // Execute search
    const notes = await Note.find(searchCriteria)
      .sort({ 
        // Boost exact title matches
        $expr: {
          $cond: [
            { $regexMatch: { input: '$title', regex: query, options: 'i' } },
            1,
            0
          ]
        },
        updatedAt: -1 
      })
      .skip(skip)
      .limit(limit)
      .select('title content folder tags starred createdAt updatedAt wordCount readingTime excerpt');

    // Get total count
    const total = await Note.countDocuments(searchCriteria);

    // Highlight search terms in results
    const highlightedNotes = notes.map(note => {
      const noteObj = note.toObject();
      
      // Highlight in title
      if (noteObj.title) {
        noteObj.highlightedTitle = noteObj.title.replace(
          searchRegex,
          `<mark>$&</mark>`
        );
      }
      
      // Highlight in excerpt
      if (noteObj.excerpt) {
        noteObj.highlightedExcerpt = noteObj.excerpt.replace(
          searchRegex,
          `<mark>$&</mark>`
        );
      }
      
      return noteObj;
    });

    // Get search suggestions (related tags and folders)
    const suggestions = await Note.aggregate([
      { $match: { userId: session.user.id, deleted: false } },
      {
        $facet: {
          folders: [
            { $group: { _id: '$folder', count: { $sum: 1 } } },
            { $match: { _id: { $ne: null } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          tags: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ]
        }
      }
    ]);

    return NextResponse.json({
      query,
      notes: highlightedNotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      suggestions: suggestions[0] || { folders: [], tags: [] },
      searchTime: Date.now() // Can be used to calculate search duration
    });

  } catch (error) {
    console.error('Error searching notes:', error);
    return NextResponse.json(
      { error: 'Failed to search notes' },
      { status: 500 }
    );
  }
}
