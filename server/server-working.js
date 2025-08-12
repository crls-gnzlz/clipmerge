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

// Middleware básico
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());

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

// Test route para la API
app.get('/api', (req, res) => {
  res.json({ message: '🔧 ClipChain API endpoint working!' });
});

// Rutas básicas de usuarios (sin middleware de validación por ahora)
app.post('/api/users/register', userController.register);
app.post('/api/users/login', userController.login);
app.get('/api/users/profile', userController.getProfile);

// Rutas básicas de clips
app.get('/api/clips', clipController.getAllClips);
app.get('/api/clips/:id', clipController.getClipById);

// Rutas básicas de chains
app.get('/api/chains', chainController.getAllChains);
app.get('/api/chains/:id', chainController.getChainById);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});
