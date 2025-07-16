import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

// GET /api/tags - Get all tags with usage statistics
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
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Build aggregation pipeline
    let pipeline = [
      { 
        $match: { 
          userId: session.user.id, 
          deleted: false,
          tags: { $exists: true, $ne: [] }
        } 
      },
      { $unwind: '$tags' }
    ];

    // Add search filter if provided
    if (search && search.trim()) {
      pipeline.push({
        $match: {
          tags: { $regex: search.trim(), $options: 'i' }
        }
      });
    }

    // Group and sort
    pipeline.push(
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          lastUsed: { $max: '$updatedAt' },
          starred: {
            $sum: {
              $cond: ['$starred', 1, 0]
            }
          }
        }
      },
      {
        $sort: { count: -1, lastUsed: -1 }
      },
      {
        $limit: limit
      }
    );

    const tagStats = await Note.aggregate(pipeline);

    // Format the results
    const tags = tagStats.map(tag => ({
      name: tag._id,
      count: tag.count,
      starred: tag.starred,
      lastUsed: tag.lastUsed
    }));

    // Get total unique tags count
    const totalTagsPipeline = [
      { 
        $match: { 
          userId: session.user.id, 
          deleted: false,
          tags: { $exists: true, $ne: [] }
        } 
      },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $count: 'total' }
    ];

    const totalTagsResult = await Note.aggregate(totalTagsPipeline);
    const totalTags = totalTagsResult[0]?.total || 0;

    return NextResponse.json({
      tags,
      totalTags,
      searchQuery: search
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Get notes by specific tags
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

    const { tags, page = 1, limit = 20 } = await request.json();

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'Tags array is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Find notes with any of the specified tags
    const notes = await Note.find({
      userId: session.user.id,
      deleted: false,
      tags: { $in: tags }
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('title content folder tags starred createdAt updatedAt wordCount readingTime excerpt');

    // Get total count
    const total = await Note.countDocuments({
      userId: session.user.id,
      deleted: false,
      tags: { $in: tags }
    });

    return NextResponse.json({
      notes,
      tags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching notes by tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes by tags' },
      { status: 500 }
    );
  }
}
