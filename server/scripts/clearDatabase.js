import mongoose from 'mongoose';
import config from '../config/config.js';

// Import models
import User from '../models/User.js';
import Clip from '../models/Clip.js';
import Chain from '../models/Chain.js';

// Function to connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Function to clear database
const clearDatabase = async () => {
  try {
    console.log('🗑️ Starting database cleanup...');
    
    // Clear all collections
    const userResult = await User.deleteMany({});
    const clipResult = await Clip.deleteMany({});
    const chainResult = await Chain.deleteMany({});
    
    console.log(`✅ Users deleted: ${userResult.deletedCount}`);
    console.log(`✅ Clips deleted: ${clipResult.deletedCount}`);
    console.log(`✅ Chains deleted: ${chainResult.deletedCount}`);
    
    console.log('\n🗑️ Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// Function to drop entire database (optional)
const dropDatabase = async () => {
  try {
    console.log('⚠️ Dropping entire database...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database dropped completely');
  } catch (error) {
    console.error('❌ Error dropping database:', error);
    throw error;
  }
};

// Main function
const clearDatabaseScript = async (dropEntire = false) => {
  try {
    console.log('🗑️ ClipChain Database Cleanup Script');
    console.log('=====================================');
    
    if (dropEntire) {
      console.log('⚠️ WARNING: This will DELETE THE ENTIRE DATABASE!');
    } else {
      console.log('⚠️ WARNING: This will DELETE ALL DATA in the clipchain database!');
    }
    
    // Connect to database
    await connectDB();
    
    if (dropEntire) {
      await dropDatabase();
    } else {
      await clearDatabase();
    }
    
    console.log('\n📊 Cleanup Summary:');
    if (dropEntire) {
      console.log('   🗑️ Entire database dropped');
    } else {
      console.log('   🗑️ All collections cleared');
    }
    console.log('   📝 Database structure removed');
    console.log('   🔄 Ready for fresh setup');
    
    console.log('\n💡 To recreate the database:');
    console.log('   1. Run: npm run db:seed');
    console.log('   2. Or use the MongoDB Compass script: database-setup.mongodb');
    
    console.log('\n✅ ClipChain database cleanup completed!');
    console.log('🌱 Database is now clean and ready for fresh data');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
};

// Check command line arguments
const args = process.argv.slice(2);
const dropEntire = args.includes('--drop-database') || args.includes('-d');

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  clearDatabaseScript(dropEntire);
}

export { clearDatabaseScript };
