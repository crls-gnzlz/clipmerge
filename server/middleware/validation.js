import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Middleware para validar los resultados de express-validator
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Datos de entrada inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Middleware para validar ObjectId de MongoDB
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'ID inválido',
      code: 'INVALID_ID'
    });
  }
  
  next();
};

// Middleware para validar paginación
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
  
  // Validar página
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      message: 'Número de página inválido',
      code: 'INVALID_PAGE'
    });
  }
  
  // Validar límite
  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      message: 'Límite de resultados inválido (máximo 100)',
      code: 'INVALID_LIMIT'
    });
  }
  
  // Validar orden
  const validOrders = ['asc', 'desc'];
  if (!validOrders.includes(order)) {
    return res.status(400).json({
      message: 'Orden inválido. Use "asc" o "desc"',
      code: 'INVALID_ORDER'
    });
  }
  
  // Añadir valores validados al request
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    sort,
    order: order === 'desc' ? -1 : 1
  };
  
  next();
};

// Middleware para validar filtros de búsqueda
const validateSearchFilters = (req, res, next) => {
  const { 
    search, 
    tags, 
    category, 
    difficulty, 
    isPublic,
    author,
    dateFrom,
    dateTo 
  } = req.query;
  
  const filters = {};
  
  // Validar búsqueda de texto
  if (search && typeof search === 'string') {
    if (search.length < 2) {
      return res.status(400).json({
        message: 'El término de búsqueda debe tener al menos 2 caracteres',
        code: 'INVALID_SEARCH'
      });
    }
    filters.search = search.trim();
  }
  
  // Validar tags
  if (tags) {
    if (Array.isArray(tags)) {
      filters.tags = tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
    } else if (typeof tags === 'string') {
      filters.tags = [tags.trim()].filter(tag => tag.length > 0);
    }
  }
  
  // Validar categoría
  if (category) {
    const validCategories = ['tutorial', 'entertainment', 'education', 'music', 'gaming', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Categoría inválida',
        code: 'INVALID_CATEGORY'
      });
    }
    filters.category = category;
  }
  
  // Validar dificultad
  if (difficulty) {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        message: 'Dificultad inválida',
        code: 'INVALID_DIFFICULTY'
      });
    }
    filters.difficulty = difficulty;
  }
  
  // Validar visibilidad
  if (isPublic !== undefined) {
    if (typeof isPublic !== 'boolean' && !['true', 'false'].includes(isPublic)) {
      return res.status(400).json({
        message: 'Valor de visibilidad inválido',
        code: 'INVALID_PUBLIC'
      });
    }
    filters.isPublic = isPublic === 'true' || isPublic === true;
  }
  
  // Validar autor
  if (author && typeof author === 'string') {
    if (mongoose.Types.ObjectId.isValid(author)) {
      filters.author = author;
    } else {
      return res.status(400).json({
        message: 'ID de autor inválido',
        code: 'INVALID_AUTHOR'
      });
    }
  }
  
  // Validar fechas
  if (dateFrom) {
    const dateFromObj = new Date(dateFrom);
    if (isNaN(dateFromObj.getTime())) {
      return res.status(400).json({
        message: 'Fecha de inicio inválida',
        code: 'INVALID_DATE_FROM'
      });
    }
    filters.dateFrom = dateFromObj;
  }
  
  if (dateTo) {
    const dateToObj = new Date(dateTo);
    if (isNaN(dateToObj.getTime())) {
      return res.status(400).json({
        message: 'Fecha de fin inválida',
        code: 'INVALID_DATE_TO'
      });
    }
    filters.dateTo = dateToObj;
  }
  
  // Añadir filtros validados al request
  req.filters = filters;
  
  next();
};

// Middleware para validar archivos
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        message: 'No se ha subido ningún archivo',
        code: 'NO_FILE'
      });
    }
    
    // Validar tipo de archivo
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
        code: 'INVALID_FILE_TYPE'
      });
    }
    
    // Validar tamaño
    if (req.file.size > maxSize) {
      return res.status(400).json({
        message: `El archivo es demasiado grande. Tamaño máximo: ${Math.round(maxSize / (1024 * 1024))}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }
    
    next();
  };
};

export {
  validateRequest,
  validateObjectId,
  validatePagination,
  validateSearchFilters,
  validateFileUpload
};
