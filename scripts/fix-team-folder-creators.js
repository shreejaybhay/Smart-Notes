const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixTeamFolderCreators() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const foldersCollection = db.collection('folders');
    const teamsCollection = db.collection('teams');

    // Find all team folders that don't have a createdBy field
    const teamFoldersWithoutCreator = await foldersCollection.find({
      isTeamFolder: true,
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    }).toArray();

    console.log(`Found ${teamFoldersWithoutCreator.length} team folders without creator information`);

    if (teamFoldersWithoutCreator.length === 0) {
      console.log('All team folders already have creator information');
      await mongoose.connection.close();
      return;
    }

    // For each folder, try to determine the creator
    for (const folder of teamFoldersWithoutCreator) {
      console.log(`Processing folder: ${folder.name} (ID: ${folder._id})`);

      if (folder.teamId) {
        // Find the team and use the owner as the creator
        const team = await teamsCollection.findOne({ _id: folder.teamId });
        
        if (team && team.ownerId) {
          console.log(`  Setting creator to team owner: ${team.ownerId}`);
          
          await foldersCollection.updateOne(
            { _id: folder._id },
            { $set: { createdBy: team.ownerId } }
          );
          
          console.log(`  ✅ Updated folder "${folder.name}"`);
        } else {
          console.log(`  ⚠️  Could not find team or team owner for folder "${folder.name}"`);
        }
      } else {
        console.log(`  ⚠️  Folder "${folder.name}" has no teamId`);
      }
    }

    console.log('✅ Team folder creator fix completed!');
    
    // Verify the fix
    const remainingFoldersWithoutCreator = await foldersCollection.find({
      isTeamFolder: true,
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    }).toArray();

    console.log(`Remaining folders without creator: ${remainingFoldersWithoutCreator.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error fixing team folder creators:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixTeamFolderCreators();
}

module.exports = fixTeamFolderCreators;
