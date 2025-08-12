import { Clip } from '../models/Clip.js';
import { User } from '../models/User.js';

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
    const clipData = {
      ...req.body,
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
        message: 'Datos de entrada inválidos',
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
        message: 'Clip no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Clip actualizado exitosamente',
      data: clip
    });
    
  } catch (error) {
    console.error('Error actualizando clip:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
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

export {
  getAllClips,
  getClipById,
  createClip,
  updateClip,
  deleteClip,
  toggleReaction,
  getUserClips,
  getPopularClips,
  getClipsByTags
};
