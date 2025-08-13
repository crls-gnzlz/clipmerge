import logger from '../utils/logger.js';

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, url, ip } = req;
  
  // Log request received
  logger.requestReceived(method, url, ip);
  
  // Override res.end to log response completion
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    const { statusCode } = res;
    
    // Log request completion
    logger.requestCompleted(method, url, statusCode, responseTime);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  const { method, url, ip } = req;
  
  logger.errorOccurred(err, {
    method,
    url,
    ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(err);
};

// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, url } = req;
    const { statusCode } = res;
    
    logger.performanceMetric(`${method} ${url}`, duration, {
      statusCode,
      contentLength: res.get('Content-Length')
    });
  });
  
  next();
};

// Database operation logging
export const logDatabaseOperation = (operation, collection, duration, details = {}) => {
  logger.performanceMetric(`DB: ${operation}`, duration, {
    collection,
    ...details
  });
};

// Authentication logging
export const logAuthEvent = (event, userId, username, details = {}) => {
  switch (event) {
    case 'login_success':
      logger.authenticationSuccess(userId, username);
      break;
    case 'login_failure':
      logger.authenticationFailure(username, details.reason);
      break;
    case 'logout':
      logger.info('🔓 User logged out', { userId, username });
      break;
    case 'token_refresh':
      logger.debug('🔄 Token refreshed', { userId, username });
      break;
    case 'token_expired':
      logger.warn('⏰ Token expired', { userId, username });
      break;
    default:
      logger.info(`🔐 Auth event: ${event}`, { userId, username, ...details });
  }
};

// Authorization logging
export const logAuthzEvent = (event, userId, action, resource, details = {}) => {
  switch (event) {
    case 'access_denied':
      logger.authorizationFailure(userId, action, resource);
      break;
    case 'access_granted':
      logger.debug('✅ Access granted', { userId, action, resource });
      break;
    default:
      logger.info(`🚫 Authz event: ${event}`, { userId, action, resource, ...details });
  }
};
