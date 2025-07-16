import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';

// POST /api/fix-member - Quick fix for the pending member issue
export async function POST(request) {
  try {
    await connectDB();
    
    const teamId = '686e6f9216b2186c9ae78537';
    const memberUserId = '686b823a7e992eec7b240083';
    
    console.log('Finding team to fix member...');
    const team = await Team.findById(teamId);
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    console.log('Current members before fix:', team.members.map(m => ({
      userId: m.userId,
      status: m.status,
      role: m.role
    })));
    
    // Find the member that needs fixing
    let memberFound = false;
    team.members.forEach(member => {
      // Handle both ObjectId and populated user objects
      const memberUserIdString = member.userId._id ? member.userId._id.toString() : member.userId.toString();
      
      if (memberUserIdString === memberUserId) {
        console.log('Found member to fix, updating status...');
        member.status = 'active';
        member.joinedAt = new Date();
        memberFound = true;
      }
    });
    
    if (!memberFound) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    await team.save();
    
    console.log('Member fixed successfully!');
    
    return NextResponse.json({ 
      message: 'Member activated successfully',
      teamId,
      memberUserId,
      status: 'active'
    });
    
  } catch (error) {
    console.error('Error fixing member:', error);
    return NextResponse.json(
      { error: 'Failed to fix member', details: error.message },
      { status: 500 }
    );
  }
}
