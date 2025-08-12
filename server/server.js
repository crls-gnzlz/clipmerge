import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config/config.js';

// Importar controladores
import * as userController from './controllers/userController.js';
import * as clipController from './controllers/clipController.js';
import * as chainController from './controllers/chainController.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = config.port;

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
mongoose.connect(config.mongoUri)
.then(() => {
  console.log('✅ Conectado a MongoDB');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🎬 ClipChain API is running successfully!' });
});

// Rutas de usuarios
app.post('/api/users/register', userController.register);
app.post('/api/users/login', userController.login);
app.get('/api/users/profile', userController.getProfile);
app.put('/api/users/profile', userController.updateProfile);
app.put('/api/users/change-password', userController.changePassword);
app.get('/api/users/profile/:username', userController.getPublicProfile);
app.get('/api/users/stats/:userId', userController.getUserStats);

// Rutas de clips
app.get('/api/clips', clipController.getAllClips);
app.get('/api/clips/:id', clipController.getClipById);
app.post('/api/clips', clipController.createClip);
app.put('/api/clips/:id', clipController.updateClip);
app.delete('/api/clips/:id', clipController.deleteClip);
app.get('/api/clips/user/:userId', clipController.getUserClips);

// Rutas de chains
app.get('/api/chains', chainController.getAllChains);
app.get('/api/chains/:id', chainController.getChainById);
app.post('/api/chains', chainController.createChain);
app.put('/api/chains/:id', chainController.updateChain);
app.delete('/api/chains/:id', chainController.deleteChain);
app.post('/api/chains/:id/clips', chainController.addClipToChain);
app.put('/api/chains/:id/clips/reorder', chainController.reorderChainClips);
app.post('/api/chains/:id/play', chainController.incrementPlays);
app.get('/api/chains/user/:userId', chainController.getUserChains);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});
