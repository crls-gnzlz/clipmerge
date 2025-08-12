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

// Function to create indexes
const createIndexes = async () => {
  try {
    console.log('🔍 Creating database indexes...');
    
    // Users indexes
    await User.collection.createIndex({ "username": 1 }, { unique: true });
    await User.collection.createIndex({ "email": 1 }, { unique: true });
    await User.collection.createIndex({ "isVerified": 1 });
    await User.collection.createIndex({ "createdAt": -1 });
    console.log('✅ Users indexes created');
    
    // Clips indexes
    await Clip.collection.createIndex({ "videoId": 1 });
    await Clip.collection.createIndex({ "author": 1 });
    await Clip.collection.createIndex({ "tags": 1 });
    await Clip.collection.createIndex({ "isPublic": 1 });
    await Clip.collection.createIndex({ "createdAt": -1 });
    console.log('✅ Clips indexes created');
    
    // Chains indexes
    await Chain.collection.createIndex({ "author": 1 });
    await Chain.collection.createIndex({ "tags": 1 });
    await Chain.collection.createIndex({ "category": 1 });
    await Chain.collection.createIndex({ "isPublic": 1 });
    await Chain.collection.createIndex({ "isFeatured": 1 });
    await Chain.collection.createIndex({ "createdAt": -1 });
    await Chain.collection.createIndex({ "clips.clip": 1 });
    console.log('✅ Chains indexes created');
    
    console.log('✅ All indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

// Function to verify database structure
const verifyDatabaseStructure = async () => {
  try {
    console.log('🔍 Verifying database structure...');
    
    // Check if collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📋 Available collections:', collectionNames);
    
    // Check if indexes exist
    const userIndexes = await User.collection.getIndexes();
    const clipIndexes = await Clip.collection.getIndexes();
    const chainIndexes = await Chain.collection.getIndexes();
    
    console.log(`🔍 Indexes found:`);
    console.log(`   Users: ${Object.keys(userIndexes).length}`);
    console.log(`   Clips: ${Object.keys(clipIndexes).length}`);
    console.log(`   Chains: ${Object.keys(chainIndexes).length}`);
    
    console.log('✅ Database structure verified');
    
  } catch (error) {
    console.error('❌ Error verifying database structure:', error);
    throw error;
  }
};

// Main function
const initDatabase = async () => {
  try {
    console.log('🚀 ClipChain Database Initialization Script');
    console.log('==========================================');
    console.log('This script will:');
    console.log('1. Connect to MongoDB');
    console.log('2. Create necessary indexes');
    console.log('3. Verify database structure');
    console.log('4. NOT populate with sample data (use db:seed for that)');
    console.log('');
    
    // Connect to database
    await connectDB();
    
    // Create indexes
    await createIndexes();
    
    // Verify structure
    await verifyDatabaseStructure();
    
    console.log('\n📊 Initialization Summary:');
    console.log('   ✅ Database connected');
    console.log('   ✅ Indexes created');
    console.log('   ✅ Structure verified');
    console.log('   🔄 Ready for data population');
    
    console.log('\n💡 Next steps:');
    console.log('   1. To populate with sample data: npm run db:seed');
    console.log('   2. To clear database: npm run db:clear');
    console.log('   3. To reset database: npm run db:reset');
    
    console.log('\n✅ ClipChain database initialization completed!');
    console.log('🌱 Database is now ready for use');
    
  } catch (error) {
    console.error('❌ Error during initialization:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export { initDatabase };
