import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import mongoose from 'mongoose';

// POST /api/teams/[id]/activate-members - Activate all pending members (for development)
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

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Find team
    const team = await Team.findById(id);

    if (!team || !team.isActive || team.isArchived) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is owner
    const ownerIdString = team.ownerId._id ? team.ownerId._id.toString() : team.ownerId.toString();
    if (ownerIdString !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team owner can activate members' },
        { status: 403 }
      );
    }

    // Activate all pending members
    let activatedCount = 0;
    team.members.forEach(member => {
      if (member.status === 'pending') {
        member.status = 'active';
        member.joinedAt = new Date();
        activatedCount++;
      }
    });

    if (activatedCount > 0) {
      await team.save();
    }

    return NextResponse.json({
      message: `Activated ${activatedCount} pending members`,
      activatedCount
    });

  } catch (error) {
    console.error('Error activating members:', error);
    return NextResponse.json(
      { 
        error: 'Failed to activate members',
        details: error.message
      },
      { status: 500 }
    );
  }
}
