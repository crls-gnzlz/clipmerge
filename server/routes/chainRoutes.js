import express from 'express';
import { body, param, query } from 'express-validator';
import * as chainController from '../controllers/chainController.js';
import { authenticateToken, optionalAuth, requireOwnership } from '../middleware/auth.js';
import { validateRequest, validateObjectId, validatePagination, validateSearchFilters } from '../middleware/validation.js';
import { Chain } from '../models/Chain.js';

const router = express.Router();

// Middleware de validación para chains
const validateChainData = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede tener más de 1000 caracteres'),
  
  body('clips')
    .optional()
    .isArray()
    .withMessage('Los clips deben ser un array'),
  
  body('clips.*.clip')
    .optional()
    .isMongoId()
    .withMessage('El ID del clip debe ser un ObjectId válido'),
  
  body('clips.*.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero no negativo'),
  
  body('clips.*.transition')
    .optional()
    .isIn(['cut', 'fade', 'crossfade', 'slide'])
    .withMessage('La transición debe ser: cut, fade, crossfade o slide'),
  
  body('clips.*.transitionDuration')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('La duración de transición debe ser entre 0 y 5 segundos'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Cada tag debe tener entre 1 y 30 caracteres'),
  
  body('category')
    .optional()
    .isIn(['tutorial', 'entertainment', 'education', 'music', 'gaming', 'other'])
    .withMessage('Categoría inválida'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Dificultad inválida'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano'),
  
  body('metadata.language')
    .optional()
    .isIn(['es', 'en', 'fr', 'de'])
    .withMessage('Idioma inválido'),
  
  body('metadata.ageRating')
    .optional()
    .isIn(['G', 'PG', 'PG-13', 'R'])
    .withMessage('Clasificación de edad inválida')
];

const validateChainUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede tener más de 1000 caracteres'),
  
  body('clips')
    .optional()
    .isArray()
    .withMessage('Los clips deben ser un array'),
  
  body('clips.*.clip')
    .optional()
    .isMongoId()
    .withMessage('El ID del clip debe ser un ObjectId válido'),
  
  body('clips.*.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero no negativo'),
  
  body('clips.*.transition')
    .optional()
    .isIn(['cut', 'fade', 'crossfade', 'slide'])
    .withMessage('La transición debe ser: cut, fade, crossfade o slide'),
  
  body('clips.*.transitionDuration')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('La duración de transición debe ser entre 0 y 5 segundos'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Cada tag debe tener entre 1 y 30 caracteres'),
  
  body('category')
    .optional()
    .isIn(['tutorial', 'entertainment', 'education', 'music', 'gaming', 'other'])
    .withMessage('Categoría inválida'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Dificultad inválida'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano')
];

const validateAddClip = [
  body('clipId')
    .isMongoId()
    .withMessage('El ID del clip debe ser un ObjectId válido'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero no negativo')
];

const validateReorderClips = [
  body('clipOrders')
    .isArray({ min: 1 })
    .withMessage('clipOrders debe ser un array no vacío'),
  
  body('clipOrders.*.clipId')
    .isMongoId()
    .withMessage('El ID del clip debe ser un ObjectId válido'),
  
  body('clipOrders.*.newOrder')
    .isInt({ min: 0 })
    .withMessage('El nuevo orden debe ser un número entero no negativo')
];

const validateReaction = [
  body('reactionType')
    .isIn(['like', 'dislike'])
    .withMessage('El tipo de reacción debe ser "like" o "dislike"')
];

// Rutas públicas (con autenticación opcional)
router.get('/', 
  optionalAuth,
  validatePagination,
  validateSearchFilters,
  chainController.getAllChains
);

router.get('/popular',
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('El límite debe ser un número entre 1 y 50'),
  chainController.getPopularChains
);

router.get('/category/:category',
  param('category').isIn(['tutorial', 'entertainment', 'education', 'music', 'gaming', 'other']).withMessage('Categoría inválida'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
  chainController.getChainsByCategory
);

router.get('/:id',
  validateObjectId,
  optionalAuth,
  chainController.getChainById
);

// Rutas que requieren autenticación
router.post('/',
  authenticateToken,
  validateChainData,
  validateRequest,
  chainController.createChain
);

router.put('/:id',
  validateObjectId,
  authenticateToken,
  requireOwnership(Chain),
  validateChainUpdate,
  validateRequest,
  chainController.updateChain
);

router.delete('/:id',
  validateObjectId,
  authenticateToken,
  requireOwnership(Chain),
  chainController.deleteChain
);

// Rutas para gestionar clips en chains
router.post('/:id/clips',
  validateObjectId,
  authenticateToken,
  requireOwnership(Chain),
  validateAddClip,
  validateRequest,
  chainController.addClipToChain
);

router.put('/:id/clips/reorder',
  validateObjectId,
  authenticateToken,
  requireOwnership(Chain),
  validateReorderClips,
  validateRequest,
  chainController.reorderChainClips
);

// Reacciones
router.post('/:id/reaction',
  validateObjectId,
  authenticateToken,
  validateReaction,
  validateRequest,
  chainController.toggleReaction
);

// Reproducciones
router.post('/:id/play',
  validateObjectId,
  chainController.incrementPlays
);

// Rutas de usuario
router.get('/user/:userId',
  authenticateToken,
  validatePagination,
  chainController.getUserChains
);

export default router;
