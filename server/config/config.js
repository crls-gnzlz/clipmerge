// Configuración de la aplicación
const config = {
  // Server configuration
  port: process.env.PORT || 9000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://carlos4g:c.g0nz.Cl1pch41n.S3rv3r@clipchaincluster.vpbfwqv.mongodb.net/clipchain?retryWrites=true&w=majority&appName=ClipchainCluster',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_super_secure_change_in_production',
  jwtExpiresIn: '7d',
  
  // CORS - Configuración flexible para desarrollo
  corsOrigin: process.env.CORS_ORIGIN || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    'file://', // Permitir archivos locales para testing
    'https://299f7f6130cd.ngrok-free.app',
    'https://069fd8d69da5.ngrok-free.app' // <--- Añadido ngrok temporalmente
  ],
  
  // Optional: MongoDB Atlas (for production)
  // mongoUri: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/clip-merger'
};

export default config;
