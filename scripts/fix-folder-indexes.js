const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixFolderIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('folders');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Drop the problematic index if it exists
    try {
      await collection.dropIndex('userId_1_name_1');
      console.log('Dropped old userId_1_name_1 index');
    } catch (error) {
      console.log('Index userId_1_name_1 does not exist or already dropped');
    }

    // Drop any other conflicting indexes
    try {
      await collection.dropIndex('userId_1_teamId_1_name_1');
      console.log('Dropped old userId_1_teamId_1_name_1 index');
    } catch (error) {
      console.log('Index userId_1_teamId_1_name_1 does not exist or already dropped');
    }

    console.log('Index cleanup completed');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixFolderIndexes();
}

module.exports = fixFolderIndexes;
