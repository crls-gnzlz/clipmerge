import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

// Registrar un nuevo usuario
const register = async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsernameOrEmail(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario o email ya está en uso'
      });
    }
    
    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password,
      displayName: displayName || username
    });
    
    await user.save();
    
    // Generar token
    const token = generateToken(user._id);
    
    // Actualizar último login
    await user.updateLastLogin();
    
    // Omitir contraseña en la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userResponse,
        token
      }
    });
    
  } catch (error) {
    console.error('Error registrando usuario:', error);
    
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

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuario por username o email
    const user = await User.findByUsernameOrEmail(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Generar token
    const token = generateToken(user._id);
    
    // Actualizar último login
    await user.updateLastLogin();
    
    // Omitir contraseña en la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: userResponse,
        token
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    // Por ahora, devolver un mensaje de que se requiere autenticación
    res.status(401).json({
      success: false,
      message: 'Autenticación requerida',
      code: 'AUTH_REQUIRED'
    });
    
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar perfil del usuario
const updateProfile = async (req, res) => {
  try {
    const updateData = req.body;
    
    // No permitir cambiar campos sensibles
    delete updateData.password;
    delete updateData.email;
    delete updateData.username;
    delete updateData.isAdmin;
    delete updateData.isVerified;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user
    });
    
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    
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

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verificar contraseña actual
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }
    
    // Actualizar contraseña
    req.user.password = newPassword;
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
    
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    
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

// Obtener perfil público de un usuario
const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username }).select('-password -email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: user.getPublicProfile()
    });
    
  } catch (error) {
    console.error('Error obteniendo perfil público:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas del usuario
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('stats username displayName avatar');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        stats: user.stats
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar usuarios
const searchUsers = async (req, res) => {
  try {
    const { search, limit = 10 } = req.query;
    
    if (!search || search.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }
    
    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ],
      isVerified: true
    })
    .select('username displayName avatar bio stats')
    .limit(parseInt(limit))
    .lean();
    
    res.json({
      success: true,
      data: users
    });
    
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Verificar si existe un username o email
const checkAvailability = async (req, res) => {
  try {
    const { field, value } = req.query;
    
    if (!['username', 'email'].includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Campo inválido. Use "username" o "email"'
      });
    }
    
    const exists = await User.exists(field, value);
    
    res.json({
      success: true,
      data: {
        field,
        value,
        available: !exists
      }
    });
    
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Renovar token (refresh token)
const refreshToken = async (req, res) => {
  try {
    // El middleware de autenticación ya verificó el token y añadió req.user
    const newToken = generateToken(req.user._id);
    
    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token: newToken
      }
    });
    
  } catch (error) {
    console.error('Error renovando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cerrar sesión (opcional, ya que JWT no se puede invalidar del lado del servidor)
const logout = async (req, res) => {
  try {
    // En una implementación real, podrías añadir el token a una blacklist
    // Por ahora, solo devolvemos un mensaje de éxito
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
    
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getPublicProfile,
  getUserStats,
  searchUsers,
  checkAvailability,
  refreshToken,
  logout
};
