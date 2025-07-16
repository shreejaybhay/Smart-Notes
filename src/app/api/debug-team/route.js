import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';

// GET /api/debug-team - Debug team member access
export async function GET(request) {
  try {
    await connectDB();

    const teamId = '686e6f9216b2186c9ae78537';
    const memberUserId = '686b823a7e992eec7b240083';

    // Only log debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== DEBUGGING TEAM ACCESS ===');
    }

    const team = await Team.findById(teamId)
      .populate('ownerId', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email');

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Team found:', {
        id: team._id,
        name: team.name,
        ownerId: team.ownerId
      });

      console.log('Raw members data:');
      team.members.forEach((member, index) => {
        console.log(`Member ${index}:`, {
          userId: member.userId,
          userIdType: typeof member.userId,
          userIdString: member.userId.toString(),
          status: member.status,
          role: member.role,
          joinedAt: member.joinedAt
        });
      });

      // Test the getMember function
      console.log('Testing getMember function...');
      console.log('getMember result:', foundMember);

      // Test canUserAccess function
      console.log('Testing canUserAccess function...');
      console.log('canUserAccess result:', hasAccess);

      // Manual search for member
      console.log('Manual member search...');
    }

    const foundMember = team.getMember(memberUserId);
    const hasAccess = team.canUserAccess(memberUserId);
    const manualMember = team.members.find(member => {
      const memberIdString = member.userId._id ? member.userId._id.toString() : member.userId.toString();
      if (process.env.NODE_ENV === 'development') {
        console.log(`Comparing: ${memberIdString} === ${memberUserId} = ${memberIdString === memberUserId}`);
      }
      return memberIdString === memberUserId;
    });
    if (process.env.NODE_ENV === 'development') {
      console.log('Manual search result:', manualMember);
    }

    return NextResponse.json({
      teamId: team._id,
      teamName: team.name,
      targetUserId: memberUserId,
      members: team.members.map(member => ({
        userId: member.userId._id || member.userId,
        userIdType: typeof member.userId,
        status: member.status,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.userId.firstName ? {
          name: `${member.userId.firstName} ${member.userId.lastName}`,
          email: member.userId.email
        } : null
      })),
      getMemberResult: foundMember ? {
        userId: foundMember.userId,
        status: foundMember.status,
        role: foundMember.role
      } : null,
      canUserAccess: hasAccess,
      manualMemberFound: manualMember ? {
        userId: manualMember.userId,
        status: manualMember.status,
        role: manualMember.role
      } : null
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Debug error:', error);
    }
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}
