import express from 'express';
import { body, param, query } from 'express-validator';
import * as clipController from '../controllers/clipController.js';
import { authenticateToken, optionalAuth, requireOwnership } from '../middleware/auth.js';
import { validateRequest, validateObjectId, validatePagination, validateSearchFilters } from '../middleware/validation.js';
import { Clip } from '../models/Clip.js';

const router = express.Router();

// Middleware de validación para clips
const validateClipData = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título debe tener entre 1 y 100 caracteres'),
  
  body('videoUrl')
    .trim()
    .isURL()
    .withMessage('La URL del video debe ser válida'),
  
  body('startTime')
    .isInt({ min: 0 })
    .withMessage('El tiempo de inicio debe ser un número entero no negativo'),
  
  body('endTime')
    .isInt({ min: 0 })
    .custom((value, { req }) => {
      return value > req.body.startTime;
    })
    .withMessage('El tiempo de fin debe ser mayor al tiempo de inicio'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede tener más de 500 caracteres'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Cada tag debe tener entre 1 y 30 caracteres'),
  
  body('status')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('El status debe ser "public" o "private"')
];

const validateClipUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título debe tener entre 1 y 100 caracteres'),
  
  body('startTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El tiempo de inicio debe ser un número entero no negativo'),
  
  body('endTime')
    .optional()
    .isInt({ min: 0 })
    .custom((value, { req }) => {
      if (req.body.startTime !== undefined) {
        return value > req.body.startTime;
      }
      return true;
    })
    .withMessage('El tiempo de fin debe ser mayor al tiempo de inicio'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede tener más de 500 caracteres'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Cada tag debe tener entre 1 y 30 caracteres'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano')
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
  clipController.getAllClips
);

router.get('/popular',
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('El límite debe ser un número entre 1 y 50'),
  validateRequest,
  clipController.getPopularClips
);

router.get('/tags',
  clipController.getAllTags
);

router.get('/tags/:tags',
  param('tags').isString().withMessage('Los tags deben ser una cadena de texto'),
  clipController.getClipsByTags
);

// Rutas de usuario (deben ir antes de /:id)
router.get('/user',
  authenticateToken,
  validatePagination,
  clipController.getUserClips
);

router.get('/user/:userId',
  authenticateToken,
  validatePagination,
  clipController.getUserClips
);

router.post('/analyze-video',
  optionalAuth,
  body('videoUrl').isURL().withMessage('La URL del video debe ser válida'),
  validateRequest,
  clipController.analyzeVideo
);

router.get('/:id',
  validateObjectId,
  optionalAuth,
  clipController.getClipById
);

// Rutas que requieren autenticación
router.post('/',
  authenticateToken,
  validateClipData,
  validateRequest,
  clipController.createClip
);

router.put('/:id',
  validateObjectId,
  authenticateToken,
  requireOwnership(Clip),
  validateClipUpdate,
  validateRequest,
  clipController.updateClip
);

router.delete('/:id',
  validateObjectId,
  authenticateToken,
  requireOwnership(Clip),
  clipController.deleteClip
);

router.post('/:id/reaction',
  validateObjectId,
  authenticateToken,
  validateReaction,
  validateRequest,
  clipController.toggleReaction
);

export default router;
