# 🎬 ClipChain - Backend API

Complete backend for the ClipChain application with MongoDB, Express.js and JWT authentication.

## 🚀 Features

- **MongoDB database** with Mongoose ODM
- **Complete RESTful API** for clips and chains
- **JWT authentication** with security middleware
- **Data validation** with express-validator
- **Authorization middleware** and access control
- **Advanced search and filtering**
- **Pagination** and sorting
- **MongoDB local or Atlas** support

## 🏗️ Architecture

```
server/
├── config/          # Application configuration
├── controllers/     # Business logic
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # Route definitions
├── scripts/         # Utility scripts
└── server.js        # Entry point
```

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local installation or MongoDB Atlas account)
- MongoDB Compass (optional, for database management)

## 🛠️ Installation

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in the project root:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clipchain
JWT_SECRET=your_jwt_secret_super_secure_here
```

### 3. Configure MongoDB
```bash
# Option A: Local MongoDB
# Ensure MongoDB is running on localhost:27017

# Option B: MongoDB Atlas
# Update MONGODB_URI in your .env file
```

### 4. Populate database with sample data
```bash
npm run db:seed
```

### 5. Start the server
```bash
# Development (with nodemon)
npm run server:dev

# Production
npm run server
```

## 🗄️ Database

### MongoDB Local
- **Port**: 27017
- **Database**: clip-merger
- **Connection**: `mongodb://localhost:27017/clip-merger`

### MongoDB Atlas
- **Connection**: Use your Atlas connection string
- **Database**: clip-merger (will be created automatically)
- **Management**: Use MongoDB Compass or Atlas web interface

## 🔐 Authentication

### User registration
```bash
POST /api/users/register
{
  "username": "user",
  "email": "user@email.com",
  "password": "password123",
  "displayName": "Display Name"
}
```

### Login
```bash
POST /api/users/login
{
  "username": "user",
  "password": "password123"
}
```

### Using the token
```bash
Authorization: Bearer <jwt_token>
```

## 📡 API Endpoints

### Clips
- `GET /api/clips` - Get all clips
- `GET /api/clips/:id` - Get clip by ID
- `POST /api/clips` - Create new clip
- `PUT /api/clips/:id` - Update clip
- `DELETE /api/clips/:id` - Delete clip

### Chains
- `GET /api/chains` - Get all chains
- `GET /api/chains/:id` - Get chain by ID
- `POST /api/chains` - Create new chain
- `PUT /api/chains/:id` - Update chain
- `DELETE /api/chains/:id` - Delete chain
- `POST /api/chains/:id/clips` - Add clip to chain
- `PUT /api/chains/:id/clips/reorder` - Reorder clips in chain
- `POST /api/chains/:id/play` - Increment play count

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/profile/:username` - Get public profile
- `GET /api/users/stats/:userId` - Get user statistics

## 🔍 Filters and Search

### Clips
```bash
GET /api/clips?search=react&tags=programming&author=userId&page=1&limit=10
```

### Chains
```bash
GET /api/chains?category=tutorial&difficulty=beginner&search=react&page=1&limit=10
```

## 📊 Sample Data

After running `npm run db:seed`, you'll have:

### Users
- **admin** (admin@clipchain.com / admin123) - Administrator
- **demo_user** (demo@clipchain.com / demo123) - Demo user
- **content_creator** (creator@clipchain.com / creator123) - Content creator

### Clips
- Introduction to React Hooks
- Best moment of the match
- Cooking tutorial - Pasta
- Guitar lesson - Basic chords
- Funny joke from the show

### Chains
- Complete React tutorial
- Best sports moments
- Basic Italian cooking

## 🧪 Testing

### Test the API
```bash
# Verify server is running
curl http://localhost:5000/

# Create a user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Get clips
curl http://localhost:5000/api/clips
```

## 🚀 Useful Commands

```bash
# Test MongoDB connection
npm run db:test

# Populate database
npm run db:seed

# Development server
npm run server:dev

# Production server
npm run server
```

## 🔧 Advanced Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Execution environment
- `MONGODB_URI`: MongoDB connection URI
- `JWT_SECRET`: Secret for signing JWT
- `JWT_EXPIRES_IN`: JWT expiration time

### MongoDB Atlas (Production)
To use MongoDB Atlas instead of local:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clip-merger
```

## 📝 Logs

The server shows detailed logs in console:
- ✅ Successful connections
- ❌ Errors and exceptions
- 🔍 Database operations
- 🔐 Authentication and authorization

## 🆘 Troubleshooting

### MongoDB connection error
1. Verify MongoDB is running locally or Atlas is accessible
2. Verify connection string in `.env` file
3. For local MongoDB: `mongosh mongodb://localhost:27017/clip-merger`
4. For Atlas: verify IP whitelist and credentials

### Port already in use error
1. Change port in `.env`
2. Verify no other process is using the port

### JWT error
1. Verify `JWT_SECRET` is configured
2. Verify token is being sent correctly

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is under the MIT License.
