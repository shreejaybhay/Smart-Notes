const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkFolders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('folders');

    // Find all folders with name "Temp Folder"
    const tempFolders = await collection.find({ name: "Temp Folder" }).toArray();
    console.log('Folders with name "Temp Folder":', tempFolders);

    // Find all team folders
    const teamFolders = await collection.find({ isTeamFolder: true }).toArray();
    console.log('All team folders:', teamFolders);

    // Check current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error checking folders:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  checkFolders();
}

module.exports = checkFolders;
