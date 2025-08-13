import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config/config.js';

// Import logging utilities
import logger from './utils/logger.js';
import { requestLogger, errorLogger, performanceMonitor } from './middleware/logging.js';

// Importar controladores
import * as userController from './controllers/userController.js';
import * as clipController from './controllers/clipController.js';
import * as chainController from './controllers/chainController.js';

// Importar rutas
import userRoutes from './routes/userRoutes.js';
import clipRoutes from './routes/clipRoutes.js';
import chainRoutes from './routes/chainRoutes.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = config.port;

// Log server startup
logger.serverStart(PORT, process.env.NODE_ENV || 'development');

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(requestLogger);
app.use(performanceMonitor);

// Conectar a MongoDB
mongoose.connect(config.mongoUri)
.then(() => {
  logger.databaseConnected(config.mongoUri);
})
.catch((error) => {
  logger.databaseError(error);
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🎬 ClipChain API is running successfully!' });
});

// Usar las rutas importadas
app.use('/api/users', userRoutes);
app.use('/api/clips', clipRoutes);
app.use('/api/chains', chainRoutes);

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 middleware
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  logger.serverReady(PORT, process.env.NODE_ENV || 'development');
  logger.info(`📱 Frontend: http://localhost:3000`);
  logger.info(`🔧 API: http://localhost:${PORT}/api`);
});
