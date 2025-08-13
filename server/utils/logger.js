import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Current log level (can be set via environment variable)
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] : LOG_LEVELS.INFO;

class Logger {
  constructor() {
    this.currentLogFile = this.getLogFileName();
    this.lastRotationDate = new Date();
    this.checkRotation();
  }

  getLogFileName() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    return `clipchain-${dateStr}.log`;
  }

  checkRotation() {
    const now = new Date();
    const daysSinceLastRotation = Math.floor((now - this.lastRotationDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastRotation >= 2) {
      this.rotateLogs();
    }
  }

  rotateLogs() {
    const now = new Date();
    this.lastRotationDate = now;
    
    // Archive old logs (keep last 30 days)
    this.archiveOldLogs();
    
    // Start new log file
    this.currentLogFile = this.getLogFileName();
    
    this.info('🔄 Log rotation completed', { 
      newFile: this.currentLogFile, 
      timestamp: now.toISOString() 
    });
  }

  archiveOldLogs() {
    try {
      const files = fs.readdirSync(logsDir);
      const logFiles = files.filter(file => file.endsWith('.log'));
      
      logFiles.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        const daysOld = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOld > 30) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error during log rotation:', error);
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    
    return `[${timestamp}] [${levelStr}] ${message}${dataStr}`;
  }

  writeToFile(message) {
    try {
      this.checkRotation();
      const logPath = path.join(logsDir, this.currentLogFile);
      fs.appendFileSync(logPath, message + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  log(level, message, data = null) {
    if (LOG_LEVELS[level.toUpperCase()] <= CURRENT_LOG_LEVEL) {
      const formattedMessage = this.formatMessage(level, message, data);
      
      // Write to file
      this.writeToFile(formattedMessage);
      
      // Also output to console with colors
      const consoleMessage = this.formatConsoleMessage(level, message, data);
      console.log(consoleMessage);
    }
  }

  formatConsoleMessage(level, message, data = null) {
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[35m', // Magenta
      TRACE: '\x1b[37m'  // White
    };
    
    const reset = '\x1b[0m';
    const color = colors[level.toUpperCase()] || '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    
    return `${color}[${level.toUpperCase()}]${reset} ${message}${dataStr}`;
  }

  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  trace(message, data = null) {
    this.log('TRACE', message, data);
  }

  // Special methods for common server events
  serverStart(port, env) {
    this.info('🚀 Server starting', { port, environment: env });
  }

  serverReady(port, env) {
    this.info('✅ Server ready', { port, environment: env });
  }

  databaseConnected(uri) {
    this.info('✅ Database connected', { uri: uri.replace(/\/\/.*@/, '//***:***@') });
  }

  databaseError(error) {
    this.error('❌ Database connection error', { error: error.message, stack: error.stack });
  }

  requestReceived(method, url, ip) {
    this.debug('📥 Request received', { method, url, ip });
  }

  requestCompleted(method, url, statusCode, responseTime) {
    this.info('📤 Request completed', { method, url, statusCode, responseTime: `${responseTime}ms` });
  }

  authenticationSuccess(userId, username) {
    this.info('🔐 Authentication successful', { userId, username });
  }

  authenticationFailure(username, reason) {
    this.warn('❌ Authentication failed', { username, reason });
  }

  authorizationFailure(userId, action, resource) {
    this.warn('🚫 Authorization failed', { userId, action, resource });
  }

  errorOccurred(error, context = {}) {
    this.error('💥 Error occurred', { 
      message: error.message, 
      stack: error.stack, 
      ...context 
    });
  }

  // Performance logging
  performanceMetric(operation, duration, details = {}) {
    if (duration > 1000) { // Log slow operations (>1s) as warnings
      this.warn('🐌 Slow operation detected', { operation, duration: `${duration}ms`, ...details });
    } else {
      this.debug('⚡ Performance metric', { operation, duration: `${duration}ms`, ...details });
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
