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
    .withMessage('Username or email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Middleware de validación para actualización de perfil
const validateProfileUpdate = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  
  body('social.youtube')
    .optional()
    .isURL()
    .withMessage('YouTube link must be a valid URL'),
  
  body('social.twitter')
    .optional()
    .isURL()
    .withMessage('Twitter link must be a valid URL'),
  
  body('social.instagram')
    .optional()
    .isURL()
    .withMessage('Instagram link must be a valid URL'),
  
  body('social.website')
    .optional()
    .isURL()
    .withMessage('Website link must be a valid URL'),
  
  body('preferences.language')
    .optional()
    .isIn(['es', 'en', 'fr', 'de'])
    .withMessage('Invalid language'),
  
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Invalid theme'),
  
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be a boolean value'),
  
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be a boolean value')
];

// Middleware de validación para cambio de contraseña
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Middleware de validación para búsqueda
const validateSearch = [
  query('search')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters long'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be a number between 1 and 50')
];

// Middleware de validación para verificación de disponibilidad
const validateAvailability = [
  query('field')
    .isIn(['username', 'email'])
    .withMessage('Field must be "username" or "email"'),
  
  query('value')
    .trim()
    .notEmpty()
    .withMessage('Value is required')
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
  param('username').trim().notEmpty().withMessage('Username is required'),
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
