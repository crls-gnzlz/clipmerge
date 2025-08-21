import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { logAuthEvent } from '../middleware/logging.js';

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

// Registrar un nuevo usuario
const register = async (req, res) => {
  try {
    const { username, email, password, referralId } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsernameOrEmail(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already in use'
      });
    }

    // Procesar referral si existe
    let referrer = null;
    if (referralId) {
      referrer = await User.findOne({ referralId });
      if (!referrer) {
        console.log(`⚠️ Referral ID no encontrado: ${referralId}`);
        // No fallar el registro si el referral no es válido
      }
    }
    
    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password,
      referredBy: referrer?._id // Asociar con el usuario referidor si existe
    });
    
    await user.save();
    
    // Generar referralId para el nuevo usuario
    if (!user.referralId) {
      user.referralId = await User.generateReferralId();
      await user.save();
    }
    
    // Actualizar estadísticas del referidor
    if (referrer) {
      try {
        await referrer.updateReferralStats(1); // ✅ Incrementa el total de referrals exitosos
        console.log(`✅ Estadísticas actualizadas para referidor: ${referrer.username} - Total Referrals: +1`);
      } catch (error) {
        console.error('❌ Error actualizando estadísticas del referidor:', error);
      }
    }
    
    // Generar token
    const token = generateToken(user._id);
    
    // Actualizar último login
    await user.updateLastLogin();
    
    // Omitir contraseña en la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        referralInfo: referrer ? {
          referredBy: referrer.username,
          referralId: referralId
        } : null
      }
    });
    
  } catch (error) {
    console.error('Error registering user:', error);
    
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
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Buscar usuario por username o email
    const identifier = username || email;
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Username or email is required'
      });
    }
    
    const user = await User.findByUsernameOrEmail(identifier);
    if (!user) {
      // Log failed login attempt
      logAuthEvent('login_failure', null, username, { reason: 'User not found' });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Log failed login attempt
      logAuthEvent('login_failure', null, username, { reason: 'Invalid password' });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generar token
    const token = generateToken(user._id);
    
    // Actualizar último login
    await user.updateLastLogin();
    
    // Log successful login
    logAuthEvent('login_success', user._id, user.username);
    
    // Omitir contraseña en la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    // El usuario ya está autenticado por el middleware authenticateToken
    // req.user contiene la información del usuario autenticado
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Omitir campos sensibles
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: userResponse
    });
    
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Actualizar perfil del usuario
const updateProfile = async (req, res) => {
  try {
    const updateData = req.body;
    
    console.log('🔧 updateProfile called with data:', updateData);
    console.log('🔧 Current user:', req.user._id);
    
    // No permitir cambiar campos sensibles
    delete updateData.password;
    delete updateData.email;
    delete updateData.isAdmin;
    delete updateData.isVerified;
    
    console.log('🔧 Update data after cleanup:', updateData);
    
    // Si se está actualizando el username, verificar que sea único
    if (updateData.username) {
      console.log('🔧 Checking username uniqueness for:', updateData.username);
      
      const existingUser = await User.findOne({ 
        username: updateData.username, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        console.log('❌ Username already exists:', updateData.username);
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
      
      console.log('✅ Username is unique');
    }
    
    console.log('🔧 Attempting to update user with data:', updateData);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('✅ User updated successfully:', user);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    
    if (error.name === 'ValidationError') {
      console.error('❌ Validation error details:', error.errors);
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
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('🔑 Password change attempt for user:', req.user._id);
    console.log('🔑 Request body:', { currentPassword: !!currentPassword, newPassword: !!newPassword });
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Fetch user with password field for comparison
    console.log('🔑 Fetching user from database...');
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('🔑 User found, checking if password field exists...');
    if (!user.password) {
      console.log('❌ User password field is missing');
      return res.status(500).json({
        success: false,
        message: 'User password field is missing'
      });
    }
    
    console.log('🔑 User found, comparing passwords...');
    
    // Verificar contraseña actual
    let isCurrentPasswordValid = false;
    try {
      isCurrentPasswordValid = await user.comparePassword(currentPassword);
      console.log('🔑 Password comparison result:', isCurrentPasswordValid);
    } catch (compareError) {
      console.error('❌ Error during password comparison:', compareError);
      return res.status(500).json({
        success: false,
        message: 'Error during password comparison'
      });
    }
    
    if (!isCurrentPasswordValid) {
      console.log('❌ Current password is incorrect');
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    console.log('🔑 Current password verified, updating to new password...');
    
    // Actualizar contraseña
    try {
      user.password = newPassword;
      console.log('🔑 Password field set, saving user...');
      await user.save();
      console.log('✅ Password updated successfully');
    } catch (saveError) {
      console.error('❌ Error saving user:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Error saving new password'
      });
    }
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error changing password:', error);
    console.error('❌ Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.log('❌ Validation error:', error.errors);
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
      message: 'Internal server error',
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
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.getPublicProfile()
    });
    
  } catch (error) {
    console.error('Error getting public profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Obtener estadísticas del usuario
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('stats username avatar');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
          res.json({
        success: true,
        data: {
          username: user.username,
          avatar: user.avatar,
          stats: user.stats
        }
      });
    
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
        message: 'Search term must be at least 2 characters long'
      });
    }
    
    const users = await User.find({
      username: { $regex: search, $options: 'i' },
      isVerified: true
    })
    .select('username avatar bio stats')
    .limit(parseInt(limit))
    .lean();
    
    res.json({
      success: true,
      data: users
    });
    
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
        message: 'Invalid field. Use "username" or "email"'
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
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
      message: 'Session closed successfully'
    });
    
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Obtener enlace de referidos del usuario
const getReferralLink = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generar referralId si no existe
    if (!user.referralId) {
      user.referralId = await User.generateReferralId();
      await user.save();
    }
    
    // Construir el enlace completo - debe apuntar al frontend, no al backend
    const baseUrl = config.frontendUrl;
    
    const referralLink = `${baseUrl}/ref/${user.referralId}`;
    
    res.json({
      success: true,
      data: {
        referralId: user.referralId,
        referralLink,
        referralStats: user.referralStats
      }
    });
    
  } catch (error) {
    console.error('Error getting referral link:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Obtener estadísticas de referidos
const getReferralStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('referralStats referralId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        referralId: user.referralId,
        referralStats: user.referralStats
      }
    });
    
  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Buscar usuario por referral ID
const findUserByReferralId = async (req, res) => {
  try {
    const { referralId } = req.params;
    
    const user = await User.findOne({ referralId }).select('username avatar');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Referral ID not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          avatar: user.avatar
        }
      }
    });
    
  } catch (error) {
    console.error('Error finding user by referral ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
  logout,
  getReferralLink,
  getReferralStats,
  findUserByReferralId
};
