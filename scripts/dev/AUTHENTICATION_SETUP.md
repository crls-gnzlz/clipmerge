# Authentication System Setup

## Overview
I've implemented a complete authentication system for your Clipchain application that integrates with your existing MongoDB backend and user model.

## What's Been Added

### 1. Frontend Components
- **Login Page** (`/login`) - Independent authentication page without sidebar
- **Register Page** (`/register`) - Independent registration page without sidebar
- **Authentication Context** - Manages user state across the app
- **Updated Sidebar** - Shows user profile and logout when authenticated
- **Updated Header** - Shows Login/Get Started buttons on public pages

### 2. Backend Integration
- Uses your existing user model and authentication endpoints
- JWT token-based authentication
- Secure password handling with bcrypt
- User session management

## Page Structure

### **Authentication Pages** (Independent - No Sidebar)
- `/login` - User login form
- `/register` - User registration form

### **Public Pages** (With Header - No Sidebar)
- `/landing` - Landing page with Login/Get Started buttons
- `/library` - Public library with Login/Get Started buttons
- `/chain/:chainId` - Public chain viewing with Login/Get Started buttons

### **Main App Pages** (With Sidebar - No Header)
- `/` - Home page
- `/dashboard` - User dashboard
- `/create` - Create clips/chains
- `/database-test` - Database testing

## Navigation Structure

### **Public Pages Header**
- Logo (links to home)
- **Login** button (links to `/login`)
- **Get Started** button (links to `/register`)

### **Sidebar (Authenticated Users)**
- User profile section (avatar, name, email)
- Navigation menu (Home, Workspace, Library, DB Test)
- Profile section (My Profile, Settings, Logout)

### **Sidebar (Unauthenticated Users)**
- Navigation menu only (Home, Workspace, Library, DB Test)

## Setup Instructions

### 1. Start Your Backend Server
Make sure your MongoDB server is running and your backend is started:

```bash
# Start MongoDB (if not already running)
mongod

# Start your backend server
cd server
npm start
```

### 2. Seed the Database with Sample Users
Run the database seeding script to create test users:

```bash
cd server/scripts
node seedDatabase.js
```

This will create three test users:
- **Admin**: `admin@clipchain.com` / `admin123`
- **Demo User**: `demo@clipchain.com` / `demo123`
- **Content Creator**: `creator@clipchain.com` / `creator123`

### 3. Start Your Frontend
In a new terminal:

```bash
npm run dev
```

## Testing the Authentication System

### 1. Test Public Pages
1. Navigate to `/landing`, `/library`, or any `/chain/:id` page
2. You should see the header with **Login** and **Get Started** buttons
3. These pages are accessible without authentication

### 2. Test Registration
1. Click **Get Started** button or navigate to `/register`
2. Create a new account with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
   - Display Name: `Test User`

### 3. Test Login
1. Click **Login** button or navigate to `/login`
2. Use the credentials you just created
3. You should be redirected to the home page
4. Check the sidebar - it should now show your user profile

### 4. Test with Existing Users
You can also test with the seeded users:
- `demo@clipchain.com` / `demo123`
- `creator@clipchain.com` / `creator123`

### 5. Test Logout
1. Click the logout button in the sidebar
2. You should be logged out and see the public navigation

## Features

### ✅ What's Working
- **Independent authentication pages** - No sidebar, clean design
- **Public page headers** - Login/Get Started buttons visible
- **User registration** with validation
- **User login** with JWT tokens
- **Secure password storage** (bcrypt)
- **User session persistence**
- **Responsive UI** with Tailwind CSS
- **Form validation** and error handling
- **Integration** with your existing API structure

### 🔄 What's Next
- Protected routes (require authentication)
- User profile management
- Password reset functionality
- Email verification
- Social login integration
- User roles and permissions

## File Structure

```
src/
├── components/
│   ├── Header.jsx (updated - shows auth buttons on public pages)
│   ├── Sidebar.jsx (updated - user profile and logout)
│   └── LayoutWithSidebar.jsx (updated - mobile menu button)
├── contexts/
│   └── AuthContext.jsx (manages auth state)
├── pages/
│   ├── Login.jsx (independent page - no sidebar)
│   └── Register.jsx (independent page - no sidebar)
├── lib/
│   └── api.js (existing - handles API calls)
└── App.jsx (updated routing logic)

server/
├── models/
│   └── User.js (existing - user schema)
├── controllers/
│   └── userController.js (existing - auth logic)
├── routes/
│   └── userRoutes.js (existing - auth endpoints)
└── scripts/
    └── seedDatabase.js (existing - creates test data)
```

## API Endpoints Used

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `POST /api/users/logout` - User logout
- `GET /api/users/profile` - Get user profile (protected)

## Security Features

- Passwords are hashed using bcrypt (12 salt rounds)
- JWT tokens for session management
- Input validation and sanitization
- CSRF protection through proper token handling
- Secure password requirements (minimum 6 characters)

## Troubleshooting

### Common Issues

1. **"Cannot connect to backend"**
   - Make sure your backend server is running on the correct port
   - Check `VITE_API_URL` in your environment variables

2. **"User already exists"**
   - The username or email is already taken
   - Try a different username/email or use the seeded accounts

3. **"Invalid credentials"**
   - Double-check your username/email and password
   - Make sure you're using the correct credentials

4. **Sidebar not updating**
   - Refresh the page after login/logout
   - Check browser console for any errors

5. **Header not showing on expected pages**
   - Public pages (`/landing`, `/library`, `/chain/:id`) show header with auth buttons
   - Main app pages (`/`, `/dashboard`) show sidebar without header

### Debug Mode
To see detailed authentication logs, check your browser's developer console and your backend server logs.

## Next Steps

Once you've tested the basic authentication:

1. **Create Protected Routes** - Require authentication for certain pages
2. **Add User Profile Management** - Allow users to edit their profiles
3. **Implement Password Reset** - Email-based password recovery
4. **Add User Roles** - Different permissions for different user types
5. **Create User Dashboard** - Personalized content and statistics

## Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check your backend server logs for API errors
3. Verify your MongoDB connection is working
4. Ensure all environment variables are set correctly

The authentication system is now ready to use with a clean, independent structure! 🎉
