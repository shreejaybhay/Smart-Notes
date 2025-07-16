// Database fix script to resolve shareToken unique constraint issue
import mongoose from 'mongoose';
import connectDB from '../lib/mongodb.js';

async function fixDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('notes');
    
    console.log('Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));
    
    // Drop the problematic shareToken index if it exists
    try {
      await collection.dropIndex('shareToken_1');
      console.log('✅ Dropped problematic shareToken_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  shareToken_1 index does not exist (already dropped)');
      } else {
        console.log('⚠️  Error dropping index:', error.message);
      }
    }
    
    // Create the correct sparse unique index
    try {
      await collection.createIndex(
        { shareToken: 1 }, 
        { 
          unique: true, 
          sparse: true,
          name: 'shareToken_sparse_unique'
        }
      );
      console.log('✅ Created new sparse unique index for shareToken');
    } catch (error) {
      console.log('⚠️  Error creating index:', error.message);
    }
    
    // Remove any duplicate null shareTokens
    console.log('Cleaning up duplicate null shareTokens...');
    const duplicateNulls = await collection.find({ shareToken: null }).toArray();
    
    if (duplicateNulls.length > 0) {
      console.log(`Found ${duplicateNulls.length} documents with null shareToken`);
      
      // Keep the first one, remove shareToken field from others
      for (let i = 1; i < duplicateNulls.length; i++) {
        await collection.updateOne(
          { _id: duplicateNulls[i]._id },
          { $unset: { shareToken: "" } }
        );
      }
      console.log(`✅ Cleaned up ${duplicateNulls.length - 1} duplicate null shareTokens`);
    } else {
      console.log('ℹ️  No duplicate null shareTokens found');
    }
    
    console.log('✅ Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the fix
fixDatabase();
