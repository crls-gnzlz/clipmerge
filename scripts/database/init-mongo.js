// MongoDB initialization script
// Runs automatically when the container is created

print('🚀 Initializing clipchain database...');

// Create the database
db = db.getSiblingDB('clipchain');

// Create collections
db.createCollection('users');
db.createCollection('clips');
db.createCollection('chains');

// Create indexes to improve performance
print('📊 Creating indexes...');

// Indexes for users
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "isVerified": 1 });
db.users.createIndex({ "createdAt": -1 });

// Indexes for clips
db.clips.createIndex({ "videoId": 1 });
db.clips.createIndex({ "author": 1 });
db.clips.createIndex({ "tags": 1 });
db.clips.createIndex({ "isPublic": 1 });
db.clips.createIndex({ "createdAt": -1 });

// Indexes for chains
db.chains.createIndex({ "author": 1 });
db.chains.createIndex({ "tags": 1 });
db.chains.createIndex({ "category": 1 });
db.chains.createIndex({ "isPublic": 1 });
db.chains.createIndex({ "isFeatured": 1 });
db.chains.createIndex({ "createdAt": -1 });
db.chains.createIndex({ "clips.clip": 1 });

print('✅ clipchain database initialized successfully');
print('📝 Collections created: users, clips, chains');
print('🔍 Indexes created to optimize queries');
print('🌐 You can access MongoDB Express at: http://localhost:8081');
print('   Username: admin, Password: password123');
