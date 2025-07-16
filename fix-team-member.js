// Quick script to fix the team member issue
import mongoose from 'mongoose';
import connectDB from './src/lib/mongodb.js';

// Team schema (simplified)
const TeamSchema = new mongoose.Schema({
  name: String,
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    status: String,
    joinedAt: Date,
    permissions: Object
  }]
});

const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

async function fixTeamMember() {
  try {
    await connectDB();
    
    const teamId = '686e6f9216b2186c9ae78537';
    const memberUserId = '686b823a7e992eec7b240083';
    
    console.log('Finding team...');
    const team = await Team.findById(teamId);
    
    if (!team) {
      console.log('Team not found');
      return;
    }
    
    console.log('Current members:', team.members);
    
    // Find and fix the member
    const member = team.members.find(m => 
      m.userId.toString() === memberUserId || 
      m.userId._id?.toString() === memberUserId
    );
    
    if (member) {
      console.log('Found member, updating status...');
      member.status = 'active';
      member.joinedAt = new Date();
      
      await team.save();
      console.log('Member updated successfully!');
    } else {
      console.log('Member not found in team');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTeamMember();
