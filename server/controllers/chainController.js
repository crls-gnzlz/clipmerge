import { Chain } from '../models/Chain.js';
import { Clip } from '../models/Clip.js';
import { User } from '../models/User.js';

// Obtener todas las chains con paginación y filtros
const getAllChains = async (req, res) => {
  try {
    // Obtener parámetros de query directamente
    const { search, category, difficulty, tags, page = 1, limit = 10, sort = 'createdAt', order = -1 } = req.query;
    
    // Construir query de filtros
    let query = { isPublic: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    // Si el usuario está autenticado, incluir sus chains privadas
    if (req.user) {
      query.$or = [
        { isPublic: true },
        { author: req.user._id }
      ];
    }
    
    // Contar total de resultados
    const total = await Chain.countDocuments(query);
    
    // Obtener chains con paginación
    const chains = await Chain.find(query)
      .populate('author', 'username avatar')
      .populate('clips.clip', 'title videoId startTime endTime duration thumbnailUrl')
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
      data: chains,
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
    console.error('Error obteniendo chains:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener una chain por ID
const getChainById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const chain = await Chain.findById(id)
      .populate('author', 'username avatar bio')
      .populate('clips.clip', 'title videoId videoUrl startTime endTime duration thumbnailUrl description tags');
    
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Chain no encontrada'
      });
    }
    
    // LOG: Mostrar los datos de los clips después del populate
    if (chain.clips && chain.clips.length > 0) {
      console.log('🔍 ChainController: Clips after populate:');
      chain.clips.forEach((c, idx) => {
        if (c.clip) {
          console.log(`  [${idx}] clipId: ${c.clip._id}, videoUrl: ${c.clip.videoUrl}, videoId: ${c.clip.videoId}`);
        } else {
          console.log(`  [${idx}] clip:`, c);
        }
      });
    } else {
      console.log('🔍 ChainController: No clips found in chain.');
    }
    
    // Verificar si el usuario puede ver la chain
    if (!chain.isPublic && (!req.user || chain.author._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta chain'
      });
    }
    
    // Incrementar vistas si no es el autor
    if (!req.user || chain.author._id.toString() !== req.user._id.toString()) {
      await chain.incrementViews();
    }
    
    res.json({
      success: true,
      data: chain
    });
    
  } catch (error) {
    console.error('Error obteniendo chain:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear una nueva chain
const createChain = async (req, res) => {
  try {
    console.log('🔍 ChainController: createChain called with body:', req.body);
    console.log('🔍 ChainController: User ID:', req.user._id);
    
    const chainData = {
      ...req.body,
      author: req.user._id
    };
    
    console.log('🔍 ChainController: Processed chain data:', chainData);
    
    // Validar que los clips existan y pertenezcan al usuario
    if (chainData.clips && chainData.clips.length > 0) {
      console.log('🔍 ChainController: Validating clips:', chainData.clips);
      for (let clipItem of chainData.clips) {
        const clip = await Clip.findById(clipItem.clip);
        if (!clip) {
          return res.status(400).json({
            success: false,
            message: `Clip con ID ${clipItem.clip} no encontrado`
          });
        }
        
        // Verificar que el usuario sea propietario del clip o el clip sea público
        if (clip.author.toString() !== req.user._id.toString() && !clip.isPublic) {
          return res.status(403).json({
            success: false,
            message: `No tienes permiso para usar el clip "${clip.title}"`
          });
        }
      }
    } else {
      console.log('🔍 ChainController: No clips to validate, creating empty chain');
    }
    
    console.log('🔍 ChainController: Creating chain with data:', chainData);
    const chain = new Chain(chainData);
    console.log('🔍 ChainController: Chain instance created, saving...');
    await chain.save();
    console.log('✅ ChainController: Chain saved successfully');
    
    // Calcular duración total
    await chain.calculateTotalDuration();
    
    // Actualizar estadísticas del usuario
    await req.user.updateStats('chains');
    
    // Poblar información
    await chain.populate('author', 'username avatar');
    await chain.populate('clips.clip', 'title videoId startTime endTime duration thumbnailUrl');
    
    res.status(201).json({
      success: true,
      message: 'Chain creada exitosamente',
      data: chain
    });
    
  } catch (error) {
    console.error('Error creando chain:', error);
    
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

// Actualizar una chain
const updateChain = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // No permitir cambiar el autor
    delete updateData.author;
    
    // Si se están actualizando los clips, validar que existan
    if (updateData.clips && updateData.clips.length > 0) {
      for (let clipItem of updateData.clips) {
        const clip = await Clip.findById(clipItem.clip);
        if (!clip) {
          return res.status(400).json({
            success: false,
            message: `Clip con ID ${clipItem.clip} no encontrado`
          });
        }
      }
    }
    
    const chain = await Chain.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('author', 'username avatar')
    .populate('clips.clip', 'title videoId startTime endTime duration thumbnailUrl');
    
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Chain no encontrada'
      });
    }
    
    // Recalcular duración total si se modificaron los clips
    if (updateData.clips) {
      await chain.calculateTotalDuration();
    }
    
    res.json({
      success: true,
      message: 'Chain actualizada exitosamente',
      data: chain
    });
    
  } catch (error) {
    console.error('Error actualizando chain:', error);
    
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

// Eliminar una chain
const deleteChain = async (req, res) => {
  try {
    const { id } = req.params;
    
    const chain = await Chain.findByIdAndDelete(id);
    
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Chain no encontrada'
      });
    }
    
    // Actualizar estadísticas del usuario
    await req.user.updateStats('chains', -1);
    
    res.json({
      success: true,
      message: 'Chain eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando chain:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Añadir un clip a una chain
const addClipToChain = async (req, res) => {
  try {
    const { id } = req.params;
    const { clipId, order } = req.body;
    
    // Verificar que el clip existe
    const clip = await Clip.findById(clipId);
    if (!clip) {
      return res.status(404).json({
        success: false,
        message: 'Clip no encontrado'
      });
    }
    
    // Verificar que el usuario sea propietario del clip o el clip sea público
    if (clip.author.toString() !== req.user._id.toString() && !clip.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para usar este clip'
      });
    }
    
    const chain = await Chain.findById(id);
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Chain no encontrada'
      });
    }
    
    // Añadir el clip
    await chain.addClip(clipId, order);
    
    // Recalcular duración total
    await chain.calculateTotalDuration();
    
    // Poblar información actualizada
    await chain.populate('author', 'username avatar');
    await chain.populate('clips.clip', 'title videoId startTime endTime duration thumbnailUrl');
    
    res.json({
      success: true,
      message: 'Clip añadido exitosamente',
      data: chain
    });
    
  } catch (error) {
    console.error('Error añadiendo clip a chain:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Reordenar clips en una chain
const reorderChainClips = async (req, res) => {
  try {
    const { id } = req.params;
    const { clipOrders } = req.body;
    
    if (!Array.isArray(clipOrders) || clipOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de órdenes de clips'
      });
    }
    
    const chain = await Chain.findById(id);
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Chain no encontrada'
      });
    }
    
    // Reordenar clips
    await chain.reorderClips(clipOrders);
    
    // Poblar información actualizada
    await chain.populate('author', 'username avatar');
    await chain.populate('clips.clip', 'title videoId startTime endTime duration thumbnailUrl');
    
    res.json({
      success: true,
      message: 'Clips reordenados exitosamente',
      data: chain
    });
    
  } catch (error) {
    console.error('Error reordenando clips:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Toggle de like/dislike para chains
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
    
    const chain = await Chain.findById(id);
    
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Chain no encontrada'
      });
    }
    
    await chain.toggleReaction(req.user._id, reactionType);
    
    // Poblar información actualizada
    await chain.populate('author', 'username avatar');
    await chain.populate('clips.clip', 'title videoId startTime endTime duration thumbnailUrl');
    await chain.populate('likes', 'username avatar');
    await chain.populate('dislikes', 'username avatar');
    
    res.json({
      success: true,
      message: 'Reacción actualizada exitosamente',
      data: chain
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

// Obtener chains del usuario autenticado
const getUserChains = async (req, res) => {
  try {
    const { pagination } = req;
    const userId = req.params.userId || req.user._id;
    
    const query = { author: userId };
    
    // Si no es el usuario autenticado, solo mostrar chains públicas
    if (userId !== req.user._id.toString()) {
      query.isPublic = true;
    }
    
    const total = await Chain.countDocuments(query);
    
    const chains = await Chain.find(query)
      .populate('author', 'username avatar')
      .populate('clips.clip', 'title videoId startTime endTime duration thumbnailUrl')
      .sort({ [pagination.sort]: pagination.order })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean();
    
    const totalPages = Math.ceil(total / pagination.limit);
    
    res.json({
      success: true,
      data: chains,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo chains del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener chains populares
const getPopularChains = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const chains = await Chain.find({ isPublic: true })
      .populate('author', 'username avatar')
      .populate('clips.clip', 'title videoId startTime endTime duration thumbnailUrl')
      .sort({ views: -1, 'likes.length': -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: chains
    });
    
  } catch (error) {
    console.error('Error obteniendo chains populares:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener chains por categoría
const getChainsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    
    const chains = await Chain.find({
      category,
      isPublic: true
    })
    .populate('author', 'username avatar')
    .populate('clips.clip', 'title videoId startTime endTime duration thumbnailUrl')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();
    
    res.json({
      success: true,
      data: chains
    });
    
  } catch (error) {
    console.error('Error obteniendo chains por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Incrementar reproducciones de una chain
const incrementPlays = async (req, res) => {
  try {
    const { id } = req.params;
    
    const chain = await Chain.findById(id);
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Chain no encontrada'
      });
    }
    
    await chain.incrementPlays();
    
    res.json({
      success: true,
      message: 'Reproducciones incrementadas',
      data: { plays: chain.plays }
    });
    
  } catch (error) {
    console.error('Error incrementando reproducciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export {
  getAllChains,
  getChainById,
  createChain,
  updateChain,
  deleteChain,
  addClipToChain,
  reorderChainClips,
  toggleReaction,
  getUserChains,
  getPopularChains,
  getChainsByCategory,
  incrementPlays
};
