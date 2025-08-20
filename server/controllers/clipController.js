import { Clip } from '../models/Clip.js';
import { User } from '../models/User.js';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Initialize YouTube API
const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY;

// Test logging - this should show up in the logs
console.log('🔑 YouTube API Key Status:', API_KEY ? 'LOADED' : 'NOT LOADED');
console.log('🔑 API Key Value:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');

// Obtener todos los clips con paginación y filtros
const getAllClips = async (req, res) => {
  try {
    // Obtener parámetros de query directamente
    const { search, tags, author, page = 1, limit = 10, sort = 'createdAt', order = -1 } = req.query;
    
    // Construir query de filtros
    let query = { isPublic: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    if (author) {
      query.author = author;
    }
    
    // Si el usuario está autenticado, incluir sus clips privados
    if (req.user) {
      query.$or = [
        { isPublic: true },
        { author: req.user._id }
      ];
    }
    
    // Contar total de resultados
    const total = await Clip.countDocuments(query);
    
    // Obtener clips con paginación
    const clips = await Clip.find(query)
      .populate('author', 'username displayName avatar')
      .sort({ [sort]: parseInt(order) })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();
    
    // Calcular información de paginación
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    
    res.json({
      success: true,
      data: clips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo clips:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un clip por ID
const getClipById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const clip = await Clip.findById(id)
      .populate('author', 'username displayName avatar bio');
    
    if (!clip) {
      return res.status(404).json({
        success: false,
        message: 'Clip no encontrado'
      });
    }
    
    // Verificar si el usuario puede ver el clip
    if (!clip.isPublic && (!req.user || clip.author._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este clip'
      });
    }
    
    // Incrementar vistas si no es el autor
    if (!req.user || clip.author._id.toString() !== req.user._id.toString()) {
      await clip.incrementViews();
    }
    
    res.json({
      success: true,
      data: clip
    });
    
  } catch (error) {
    console.error('Error obteniendo clip:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear un nuevo clip
const createClip = async (req, res) => {
  try {
    const videoUrl = req.body.videoUrl;
    const videoId = extractYouTubeVideoId(videoUrl);
    const clipData = {
      ...req.body,
      videoId,
      author: req.user._id
    };
    
    const clip = new Clip(clipData);
    await clip.save();
    
    // Actualizar estadísticas del usuario
    await req.user.updateStats('clips');
    
    // Poblar información del autor
    await clip.populate('author', 'username displayName avatar');
    
    res.status(201).json({
      success: true,
      message: 'Clip creado exitosamente',
      data: clip
    });
    
  } catch (error) {
    console.error('Error creando clip:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar un clip
const updateClip = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // Log para depuración
    console.log('[updateClip] Incoming startTime:', updateData.startTime, 'endTime:', updateData.endTime);
    // Validación explícita antes de actualizar
    if (
      typeof updateData.startTime !== 'undefined' &&
      typeof updateData.endTime !== 'undefined' &&
      Number(updateData.endTime) <= Number(updateData.startTime)
    ) {
      return res.status(400).json({
        success: false,
        message: 'End time must be greater than start time',
        errors: [{ field: 'endTime', message: 'End time must be greater than start time' }]
      });
    }
    // No permitir cambiar el autor
    delete updateData.author;
    const clip = await Clip.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username displayName avatar');
    if (!clip) {
      return res.status(404).json({
        success: false,
        message: 'Clip not found'
      });
    }
    res.json({
      success: true,
      message: 'Clip updated successfully',
      data: clip
    });
  } catch (error) {
    console.error('Error updating clip:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid input data',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Eliminar un clip
const deleteClip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const clip = await Clip.findByIdAndDelete(id);
    
    if (!clip) {
      return res.status(404).json({
        success: false,
        message: 'Clip no encontrado'
      });
    }
    
    // Actualizar estadísticas del usuario
    await req.user.updateStats('clips', -1);
    
    res.json({
      success: true,
      message: 'Clip eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando clip:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Toggle de like/dislike
const toggleReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reactionType } = req.body;
    
    if (!['like', 'dislike'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de reacción inválido'
      });
    }
    
    const clip = await Clip.findById(id);
    
    if (!clip) {
      return res.status(404).json({
        success: false,
        message: 'Clip no encontrado'
      });
    }
    
    await clip.toggleReaction(req.user._id, reactionType);
    
    // Poblar información actualizada
    await clip.populate('author', 'username displayName avatar');
    await clip.populate('likes', 'username displayName avatar');
    await clip.populate('dislikes', 'username displayName avatar');
    
    res.json({
      success: true,
      message: 'Reacción actualizada exitosamente',
      data: clip
    });
    
  } catch (error) {
    console.error('Error actualizando reacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener clips del usuario autenticado
const getUserClips = async (req, res) => {
  try {
    const { pagination } = req;
    const userId = req.params.userId || req.user._id;
    
    const query = { author: userId };
    
    // Si no es el usuario autenticado, solo mostrar clips públicos
    if (userId !== req.user._id.toString()) {
      query.isPublic = true;
    }
    
    const total = await Clip.countDocuments(query);
    
    const clips = await Clip.find(query)
      .populate('author', 'username displayName avatar')
      .sort({ [pagination.sort]: pagination.order })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean();
    
    const totalPages = Math.ceil(total / pagination.limit);
    
    res.json({
      success: true,
      data: clips,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo clips del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener clips populares
const getPopularClips = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const clips = await Clip.find({ isPublic: true })
      .populate('author', 'username displayName avatar')
      .sort({ views: -1, 'likes.length': -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: clips
    });
    
  } catch (error) {
    console.error('Error obteniendo clips populares:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener clips por tags
const getClipsByTags = async (req, res) => {
  try {
    const { tags } = req.params;
    const tagArray = tags.split(',').map(tag => tag.trim());
    
    const clips = await Clip.find({
      tags: { $in: tagArray },
      isPublic: true
    })
    .populate('author', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
    
    res.json({
      success: true,
      data: clips
    });
    
  } catch (error) {
    console.error('Error obteniendo clips por tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los tags únicos
const getAllTags = async (req, res) => {
  try {
    const tags = await Clip.distinct('tags', { isPublic: true });
    
    res.json({
      success: true,
      data: tags.sort()
    });
    
  } catch (error) {
    console.error('Error obteniendo tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Analizar video para obtener duración
const analyzeVideo = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    // Extract YouTube video ID
    const extractYouTubeId = (url) => {
      if (!url) return null;
      
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/watch\?.*&v=([^&\n?#]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      
      return null;
    };
    
    const youtubeId = extractYouTubeId(videoUrl);
    
    if (!youtubeId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL provided'
      });
    }
    
    let videoMetadata;
    
    // Try to use real YouTube API if key is available
    if (API_KEY) {
      try {
        console.log(`🎥 Fetching real data for video: ${youtubeId}`);
        console.log(`🔑 Using API key: ${API_KEY.substring(0, 10)}...`);
        
        const response = await youtube.videos.list({
          key: API_KEY,
          part: 'snippet,contentDetails,statistics',
          id: youtubeId
        });
        
        console.log(`📡 YouTube API response status: ${response.status}`);
        console.log(`📡 YouTube API response items: ${response.data.items ? response.data.items.length : 0}`);
        
        if (response.data.items && response.data.items.length > 0) {
          const video = response.data.items[0];
          const snippet = video.snippet;
          const contentDetails = video.contentDetails;
          const statistics = video.statistics;
          
          // Parse duration (ISO 8601 format: PT4M13S)
          const duration = parseDuration(contentDetails.duration);
          
          videoMetadata = {
            id: youtubeId,
            title: snippet.title,
            thumbnail: snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
            duration,
            channel: snippet.channelTitle,
            viewCount: parseInt(statistics.viewCount) || 0,
            description: snippet.description,
            publishedAt: snippet.publishedAt,
            category: snippet.categoryId,
            tags: snippet.tags || []
          };
          
          console.log(`✅ Real YouTube data fetched: ${snippet.title}`);
          console.log(`✅ Channel: ${snippet.channelTitle}`);
          console.log(`✅ Duration: ${duration}s`);
        } else {
          throw new Error('Video not found');
        }
      } catch (apiError) {
        console.warn(`⚠️ YouTube API failed, falling back to mock data:`, apiError.message);
        console.warn(`⚠️ API Error details:`, apiError);
        // Fall back to mock data if API fails
        videoMetadata = generateMockMetadata(youtubeId);
      }
    } else {
      // No API key, use mock data
      console.log(`📝 No YouTube API key, using mock data for: ${youtubeId}`);
      console.log(`📝 API_KEY value:`, API_KEY);
      videoMetadata = generateMockMetadata(youtubeId);
    }
    
    res.json({
      success: true,
      data: videoMetadata
    });
    
  } catch (error) {
    console.error('Error analizando video:', error);
    res.status(500).json({
      success: false,
      message: 'Error analizando el video',
      error: error.message
    });
  }
};

// Helper function to parse YouTube duration (ISO 8601)
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  let hours = 0, minutes = 0, seconds = 0;
  
  if (match[1]) hours = parseInt(match[1]);
  if (match[2]) minutes = parseInt(match[2]);
  if (match[3]) seconds = parseInt(match[3]);
  
  return hours * 3600 + minutes * 60 + seconds;
};

// Helper function to generate mock metadata
const generateMockMetadata = (youtubeId) => {
  const hash = youtubeId.split('').reduce((a, b) => {
    a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
    return a;
  }, 0);
  
  const duration = Math.abs(hash % 2520) + 180; // 3-45 minutes in seconds
  
  return {
    id: youtubeId,
    title: `Sample Video ${youtubeId.substring(0, 6)} - A comprehensive tutorial on modern web development techniques`,
    thumbnail: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
    duration,
    channel: `Channel ${youtubeId.substring(0, 4)}`,
    viewCount: Math.floor(Math.random() * 1000000) + 1000,
    description: `This is a sample video with ID ${youtubeId}. In production, this would contain the actual video description from YouTube.`,
    publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Education',
    tags: ['Tutorial', 'Web Development', 'JavaScript']
  };
};

const extractYouTubeVideoId = (url) => {
  if (!url) return '';
  // Typical YouTube URL patterns
  const regex = /(?:v=|youtu.be\/|embed\/|\/v\/|\/e\/|watch\?v=|\&v=)([\w-]{8,})/;
  const match = url.match(regex);
  if (match && match[1]) return match[1];
  // Fallback: try to get last part after /
  const parts = url.split('/');
  return parts[parts.length - 1].split('?')[0];
};

export {
  getAllClips,
  getClipById,
  createClip,
  updateClip,
  deleteClip,
  toggleReaction,
  getUserClips,
  getPopularClips,
  getClipsByTags,
  getAllTags,
  analyzeVideo
};
