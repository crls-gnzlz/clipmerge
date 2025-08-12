// Configuración de la aplicación
const config = {
  // Server configuration
  port: process.env.PORT || 9000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://carlos4g:c.g0nz.Cl1pch41n.S3rv3r@clipchaincluster.vpbfwqv.mongodb.net/clip-merger?retryWrites=true&w=majority&appName=ClipchainCluster',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_super_secure_change_in_production',
  jwtExpiresIn: '7d',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Optional: MongoDB Atlas (for production)
  // mongoUri: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/clip-merger'
};

export default config;
