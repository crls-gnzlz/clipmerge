# Environment Configuration Guide

## 🔐 Environment Variables Setup

This project uses environment variables to store sensitive configuration data. **Never commit the actual `.env` file to version control.**

### 📁 Files Structure

- `.env` - **DO NOT COMMIT** - Contains your actual API keys and database credentials
- `.env.example` - **Safe to commit** - Template with placeholder values
- `.gitignore` - Already configured to exclude `.env` files

### 🚀 Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your actual values:**
   ```bash
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_here
   
   # YouTube API Configuration
   YOUTUBE_API_KEY=your_actual_youtube_api_key_here
   ```

### 🔑 Required API Keys

#### YouTube Data API v3
- **Get your key:** [Google Cloud Console](https://console.cloud.google.com/)
- **Enable:** YouTube Data API v3
- **Quota:** Free tier includes 10,000 requests/day

#### MongoDB Atlas
- **Create cluster:** [MongoDB Atlas](https://cloud.mongodb.com/)
- **Get connection string:** From your cluster dashboard
- **Network access:** Add your IP address or `0.0.0.0/0` for development

### ��️ Security Best Practices

1. **Never commit `.env` files**
2. **Use strong, unique JWT secrets**
3. **Restrict MongoDB network access**
4. **Rotate API keys regularly**
5. **Use environment-specific files** (`.env.development`, `.env.production`)

### 🚨 Troubleshooting

- **"No YouTube API key"**: Check `.env` file exists and `YOUTUBE_API_KEY` is set
- **"Database connection failed"**: Verify `MONGODB_URI` and network access
- **"JWT secret not found"**: Ensure `JWT_SECRET` is set in `.env`

### 📝 For Team Members

When cloning the repository:
1. Copy `.env.example` to `.env`
2. Fill in your local development values
3. Ask team lead for production credentials
4. Never share your `.env` file
