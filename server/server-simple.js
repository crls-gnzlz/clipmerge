import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config/config.js';

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

// Rutas básicas de la API
app.get('/api/clips', (req, res) => {
  res.json({ message: '🎬 Clips endpoint working!' });
});

app.get('/api/chains', (req, res) => {
  res.json({ message: '🔗 Chains endpoint working!' });
});

app.get('/api/users', (req, res) => {
  res.json({ message: '👥 Users endpoint working!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});
