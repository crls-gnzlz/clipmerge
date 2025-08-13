# Login Troubleshooting Guide

## Problem
Unable to login with the creator account: `creator@clipchain.com` / `creator123`

## What I've Fixed
1. ✅ **Updated error messages** from Spanish to English
2. ✅ **Added debugging logs** to frontend and backend
3. ✅ **Created test script** to verify database state

## Step-by-Step Troubleshooting

### 1. Check Backend Server
Make sure your backend server is running:
```bash
cd server
npm start
```

You should see:
```
✅ Server running on port 9000
✅ Connected to MongoDB
```

### 2. Test Database Connection
Run the test script to check if the creator user exists:
```bash
cd server/scripts
node testLogin.js
```

This will show you:
- If the creator user exists
- If the password hash is correct
- If the login simulation works
- All users in the database

### 3. Re-seed Database (if needed)
If the test shows no users or login fails:
```bash
cd server/scripts
node seedDatabase.js
```

This will create:
- `admin@clipchain.com` / `admin123`
- `demo@clipchain.com` / `demo123`
- `creator@clipchain.com` / `creator123`

### 4. Test Login in Browser
1. Open browser developer console (F12)
2. Navigate to `/login`
3. Try to login with `creator@clipchain.com` / `creator123`
4. Check console for debug logs

You should see logs like:
```
🔐 Attempting login with: {username: "creator@clipchain.com", password: "creator123"}
🔐 AuthContext: Starting login process...
🔐 AuthContext: API response received: {...}
```

### 5. Check Network Tab
In browser developer tools:
1. Go to Network tab
2. Try to login
3. Look for the POST request to `/api/users/login`
4. Check the response status and body

## Common Issues & Solutions

### Issue: "User not found"
**Solution**: Run `node seedDatabase.js` to create test users

### Issue: "Password invalid"
**Solution**: The password hash might be corrupted, re-seed the database

### Issue: "Cannot connect to backend"
**Solution**: 
- Check if backend server is running
- Verify `VITE_API_URL` in your environment
- Check if MongoDB is running

### Issue: "Validation failed"
**Solution**: Check the request payload format in Network tab

## Debug Information

### Frontend Logs
- Login attempt details
- API response
- Error messages

### Backend Logs
- User lookup results
- Password comparison results
- JWT token generation

### Database State
- User existence
- Password hash verification
- User metadata

## Test Credentials

After running `seedDatabase.js`, these accounts should work:

| Email | Password | Username | Display Name |
|-------|----------|----------|--------------|
| `admin@clipchain.com` | `admin123` | `admin` | `Administrator` |
| `demo@clipchain.com` | `demo123` | `demo_user` | `Demo User` |
| `creator@clipchain.com` | `creator123` | `content_creator` | `Content Creator` |

## Next Steps

1. **Run the test script** to verify database state
2. **Check browser console** for debug logs
3. **Verify backend is running** and connected to MongoDB
4. **Re-seed database** if users don't exist
5. **Check network requests** for API errors

## Still Having Issues?

If the problem persists:
1. Share the console logs from the test script
2. Share the browser console logs
3. Share the network request/response details
4. Check if MongoDB connection is working

The debugging logs should now give us much more information about what's happening during the login process! 🔍
