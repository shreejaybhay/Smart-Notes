import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/users/search - Search users by email or name for sharing
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
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({
        users: [],
        total: 0,
        query: query.trim()
      });
    }

    // Build search query
    const searchRegex = new RegExp(query.trim(), 'i');
    const searchQuery = {
      $and: [
        {
          $or: [
            { email: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex }
          ]
        },
        // Exclude current user
        { _id: { $ne: session.user.id } },
        // Only active users
        { isActive: true }
      ]
    };

    // Find users
    const users = await User.find(searchQuery)
      .select('firstName lastName email image')
      .limit(limit)
      .sort({ firstName: 1, lastName: 1 });

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      avatar: user.image
    }));

    return NextResponse.json({
      users: transformedUsers,
      total: transformedUsers.length,
      query: query.trim()
    });

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}