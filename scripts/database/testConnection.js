import mongoose from 'mongoose';
import config from '../config/config.js';

const testConnection = async () => {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log(`📍 URI: ${config.mongoUri}`);
    
    await mongoose.connect(config.mongoUri);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔢 Port: ${mongoose.connection.port}`);
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Collections:');
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(`   Error: ${error.message}`);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Make sure MongoDB is running locally on port 27017');
    console.error('   2. Check your .env file has the correct MONGODB_URI');
    console.error('   3. For MongoDB Atlas, verify your connection string');
    console.error('   4. Ensure your IP is whitelisted (for Atlas)');
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection();
}

export { testConnection };
