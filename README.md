# 🎬 ClipChain

A web application that allows users to save and play video clips by selecting time intervals within videos and grouping them into shareable collections.

## 🚀 Technologies

- **Frontend**: React with Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Database**: MongoDB (document-oriented, local or Atlas)
- **Development**: MongoDB local or MongoDB Atlas

## 🏗️ Project Structure

```
clipchain/
├── src/                 # React Frontend
│   ├── components/      # Reusable components
│   ├── pages/          # Main views
│   ├── lib/            # Helper logic and API service
│   ├── config/         # Frontend configuration
│   └── data/           # Mock data
├── server/              # Node.js Backend
│   ├── models/         # MongoDB schemas
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   ├── middleware/     # Authentication & validation
│   ├── config/         # Backend configuration
│   └── scripts/        # Database utilities
├── .env                 # Environment configuration
└── database-setup.mongodb # MongoDB Compass setup script
```

## ✨ Features

### Frontend
- ✅ Navigation with React Router
- ✅ Responsive design with Tailwind CSS
- ✅ Scalable folder structure
- ✅ Reusable components
- ✅ YouTube URL parsing utilities
- ✅ Mock data for development

### Backend
- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose ODM
- ✅ JWT authentication system
- ✅ User management and profiles
- ✅ Clip and Chain CRUD operations
- ✅ Advanced search and filtering
- ✅ Data validation and sanitization

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure MongoDB:
   - **Option A**: Install MongoDB locally and ensure it's running on port 27017
   - **Option B**: Use MongoDB Atlas and update the connection string in `.env`
4. Create `.env` file with your MongoDB connection string
5. Run the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run preview` - Previews the production build
- `npm run lint` - Runs the linter
- `npm run server:dev` - Starts the backend server in development mode
- `npm run db:seed` - Seeds the database with sample data

## Upcoming Features

- [ ] Clip creation with time selection
- [ ] Collection management
- [ ] Clip playback
- [ ] User system
- [ ] Share collections
