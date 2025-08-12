import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import config from '../config/config.js';

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido',
        code: 'TOKEN_MISSING'
      });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Añadir el usuario al request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Error en autenticación:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware opcional para autenticación (no bloquea si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Si hay error en el token, simplemente continuar sin usuario
    next();
  }
};

// Middleware para verificar si el usuario es admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Autenticación requerida',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

// Middleware para verificar si el usuario es propietario del recurso
const requireOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ 
          message: 'Recurso no encontrado',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Permitir acceso si es admin o propietario
      if (req.user.isAdmin || resource.author.toString() === req.user._id.toString()) {
        req.resource = resource;
        next();
      } else {
        return res.status(403).json({ 
          message: 'Acceso denegado. No eres propietario de este recurso',
          code: 'OWNERSHIP_REQUIRED'
        });
      }
      
    } catch (error) {
      console.error('Error en verificación de propiedad:', error);
      return res.status(500).json({ 
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Middleware para verificar si el usuario está verificado
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      message: 'Tu cuenta debe estar verificada para realizar esta acción',
      code: 'VERIFICATION_REQUIRED'
    });
  }
  
  next();
};

export {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireOwnership,
  requireVerification
};
