# 🎬 ClipChain - MongoDB Compass Setup Guide

## 📋 Prerequisites

- **MongoDB Compass** installed on your machine
- **MongoDB instance** running (local or remote)
- **ClipChain application** ready to connect

## 🚀 Step-by-Step Setup

### 1. Open MongoDB Compass

1. Launch MongoDB Compass
2. Connect to your MongoDB instance:
   - **Local**: `mongodb://localhost:27017`
   - **Docker**: `mongodb://admin:password123@localhost:27017`
   - **Remote**: Your MongoDB Atlas connection string

### 2. Create Database

1. Click **"Create Database"**
2. **Database Name**: `clipchain`
3. **Collection Name**: `users` (we'll create the others via script)
4. Click **"Create Database"**

### 3. Open MongoDB Shell

1. In the `clipchain` database view
2. Click the **"Shell"** tab (bottom of the screen)
3. This opens the MongoDB shell (mongosh) within Compass

### 4. Execute the Setup Script

1. **Copy the entire content** from `database-setup.mongodb`
2. **Paste it** into the MongoDB shell in Compass
3. **Press Enter** to execute the entire script

### 5. Verify Setup

The script will show progress messages and a final summary:

```
📊 Database Summary:
   👥 Users: 3
   🎬 Clips: 8
   🔗 Chains: 4
   🔍 Total Indexes: 15

🔑 Access Credentials:
   Admin: admin@clipchain.com / admin123
   Demo: demo@clipchain.com / demo123
   Creator: creator@clipchain.com / creator123

✅ ClipChain database setup completed successfully!
```

## 🔍 What Gets Created

### Collections
- **`users`** - User accounts and profiles
- **`clips`** - Video clip segments
- **`chains`** - Sequences of clips

### Indexes
- **Performance indexes** for fast queries
- **Unique constraints** for usernames and emails
- **Search indexes** for tags and categories

### Sample Data
- **3 Users** with different roles and preferences
- **8 Clips** covering various categories (programming, sports, music, cooking)
- **4 Chains** demonstrating different use cases
- **Realistic metadata** including views, timestamps, and descriptions

## 🧪 Testing the Setup

### 1. Browse Collections
- Navigate through each collection in Compass
- Verify documents are properly structured
- Check that indexes are created

### 2. Test Queries
Try these sample queries in the MongoDB shell:

```javascript
// Find all programming clips
db.clips.find({ tags: "programming" })

// Find chains by category
db.chains.find({ category: "tutorial" })

// Find users with admin privileges
db.users.find({ isAdmin: true })

// Count total views across all clips
db.clips.aggregate([
  { $group: { _id: null, totalViews: { $sum: "$views" } } }
])
```

### 3. Connect Your Application
Update your application's MongoDB connection string to point to the `clipchain` database.

## 🔧 Troubleshooting

### Common Issues

#### "Collection already exists"
- The script handles this gracefully
- Collections will be reused if they exist

#### "Index already exists"
- Indexes are created with `createIndex()` which is idempotent
- No errors will occur if indexes already exist

#### "Connection failed"
- Verify MongoDB is running
- Check connection string format
- Ensure network access if using remote MongoDB

#### "Authentication failed"
- For Docker setup: use `admin:password123`
- For local setup: ensure authentication is disabled or credentials are correct

### Reset Database

If you need to start over:

```javascript
// Drop all collections
db.users.drop()
db.clips.drop()
db.chains.drop()

// Re-run the setup script
```

## 📊 Data Structure Overview

### Users Collection
```javascript
{
  username: "admin",
  email: "admin@clipchain.com",
  password: "hashed_password",
  displayName: "Administrator",
  isAdmin: true,
  stats: { totalClips: 0, totalChains: 0, totalViews: 0 },
  preferences: { language: "en", theme: "light" }
}
```

### Clips Collection
```javascript
{
  title: "Introduction to React Hooks",
  videoId: "TNhaISOU2GU",
  startTime: 120,
  endTime: 300,
  duration: 180,
  tags: ["programming", "react", "javascript"],
  author: "user_object_id",
  views: 45
}
```

### Chains Collection
```javascript
{
  name: "Complete React Tutorial Series",
  description: "Comprehensive React tutorial...",
  clips: [
    { clip: "clip_object_id", order: 0, transition: "fade" }
  ],
  category: "tutorial",
  difficulty: "beginner",
  totalDuration: 430,
  views: 78,
  plays: 23
}
```

## 🎯 Next Steps

1. **Test your application** with the new database
2. **Create additional test data** as needed
3. **Explore the API endpoints** using the sample data
4. **Customize the data structure** for your specific needs

## 📚 Additional Resources

- **MongoDB Compass Documentation**: [https://docs.mongodb.com/compass/](https://docs.mongodb.com/compass/)
- **MongoDB Shell Commands**: [https://docs.mongodb.com/mongodb-shell/](https://docs.mongodb.com/mongodb-shell/)
- **ClipChain Backend API**: See `server/README.md` for API documentation

---

**🎉 Congratulations!** Your ClipChain database is now ready with realistic test data. You can start building and testing your application features immediately.


