const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function cleanTempFolders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('folders');

    // Delete the team folder with name "Temp Folder"
    const result = await collection.deleteMany({ 
      name: "Temp Folder", 
      isTeamFolder: true 
    });
    
    console.log(`Deleted ${result.deletedCount} team folders with name "Temp Folder"`);

    // Check remaining folders
    const remainingFolders = await collection.find({ name: "Temp Folder" }).toArray();
    console.log('Remaining folders with name "Temp Folder":', remainingFolders);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error cleaning folders:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanTempFolders();
}

module.exports = cleanTempFolders;
