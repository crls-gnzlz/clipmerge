import express from 'express';
import { body, param, query } from 'express-validator';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Middleware de validación para registro
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres y solo puede contener letras, números y guiones bajos'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Por favor introduce un email válido'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre de visualización debe tener entre 1 y 50 caracteres')
];

// Middleware de validación para login
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario o email es obligatorio'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
];

// Middleware de validación para actualización de perfil
const validateProfileUpdate = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre de visualización debe tener entre 1 y 50 caracteres'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La biografía no puede tener más de 500 caracteres'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('El avatar debe ser una URL válida'),
  
  body('social.youtube')
    .optional()
    .isURL()
    .withMessage('El enlace de YouTube debe ser una URL válida'),
  
  body('social.twitter')
    .optional()
    .isURL()
    .withMessage('El enlace de Twitter debe ser una URL válida'),
  
  body('social.instagram')
    .optional()
    .isURL()
    .withMessage('El enlace de Instagram debe ser una URL válida'),
  
  body('social.website')
    .optional()
    .isURL()
    .withMessage('El enlace del sitio web debe ser una URL válida'),
  
  body('preferences.language')
    .optional()
    .isIn(['es', 'en', 'fr', 'de'])
    .withMessage('Idioma inválido'),
  
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Tema inválido'),
  
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('La preferencia de notificaciones por email debe ser un valor booleano'),
  
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('La preferencia de notificaciones push debe ser un valor booleano')
];

// Middleware de validación para cambio de contraseña
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es obligatoria'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

// Middleware de validación para búsqueda
const validateSearch = [
  query('search')
    .trim()
    .isLength({ min: 2 })
    .withMessage('El término de búsqueda debe tener al menos 2 caracteres'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser un número entre 1 y 50')
];

// Middleware de validación para verificación de disponibilidad
const validateAvailability = [
  query('field')
    .isIn(['username', 'email'])
    .withMessage('El campo debe ser "username" o "email"'),
  
  query('value')
    .trim()
    .notEmpty()
    .withMessage('El valor es obligatorio')
];

// Rutas públicas
router.post('/register',
  validateRegistration,
  validateRequest,
  userController.register
);

router.post('/login',
  validateLogin,
  validateRequest,
  userController.login
);

router.get('/profile/:username',
  param('username').trim().notEmpty().withMessage('El nombre de usuario es obligatorio'),
  userController.getPublicProfile
);

router.get('/stats/:userId',
  validateObjectId,
  userController.getUserStats
);

router.get('/search',
  validateSearch,
  validateRequest,
  userController.searchUsers
);

router.get('/check-availability',
  validateAvailability,
  validateRequest,
  userController.checkAvailability
);

// Rutas que requieren autenticación
router.get('/profile',
  authenticateToken,
  userController.getProfile
);

router.put('/profile',
  authenticateToken,
  validateProfileUpdate,
  validateRequest,
  userController.updateProfile
);

router.put('/change-password',
  authenticateToken,
  validatePasswordChange,
  validateRequest,
  userController.changePassword
);

router.post('/refresh-token',
  authenticateToken,
  userController.refreshToken
);

router.post('/logout',
  authenticateToken,
  userController.logout
);

export default router;
