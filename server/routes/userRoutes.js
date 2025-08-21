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
    .withMessage('Username must be between 3 and 30 characters and can only contain letters, numbers and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  

];

// Middleware de validación para login
const validateLogin = [
  body('username')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Username is required if provided'),
  
  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email is required if provided'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  // Custom validation to ensure either username or email is provided
  body()
    .custom((value, { req }) => {
      if (!req.body.username && !req.body.email) {
        throw new Error('Either username or email is required');
      }
      return true;
    })
];

// Middleware de validación para actualización de perfil
const validateProfileUpdate = [

  
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

// Rutas del sistema de referidos
router.get('/referral-link',
  authenticateToken,
  userController.getReferralLink
);

router.get('/referral-stats',
  authenticateToken,
  userController.getReferralStats
);

// Ruta pública para buscar usuario por referral ID
router.get('/referral/:referralId',
  param('referralId').trim().notEmpty().withMessage('Referral ID is required'),
  userController.findUserByReferralId
);

export default router;
