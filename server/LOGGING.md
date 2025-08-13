# 📋 ClipChain Server Logging System

## Overview

The ClipChain server now includes a comprehensive logging system that automatically tracks all server activities, requests, errors, and performance metrics. Logs are automatically rotated every 2 days to prevent excessive file sizes.

## Features

- **Automatic Log Rotation**: New log files every 2 days
- **Multiple Log Levels**: ERROR, WARN, INFO, DEBUG, TRACE
- **Structured Logging**: JSON-formatted data with timestamps
- **Performance Monitoring**: Automatic detection of slow operations
- **Authentication Tracking**: Login attempts, failures, and successes
- **Request Logging**: All HTTP requests with response times
- **Error Tracking**: Detailed error logging with stack traces
- **File Management**: Automatic cleanup of logs older than 30 days

## Log Files

Logs are stored in the `server/logs/` directory with the following naming convention:
- `clipchain-YYYY-MM-DD.log` (e.g., `clipchain-2024-01-15.log`)

## Log Levels

### ERROR (0)
Critical errors that require immediate attention:
- Database connection failures
- Server startup failures
- Unhandled exceptions
- Authentication system failures

### WARN (1)
Warning conditions that should be monitored:
- Slow database operations (>1 second)
- Failed authentication attempts
- Authorization failures
- Resource usage warnings

### INFO (2)
General information about server operation:
- Server startup/shutdown
- Database connections
- Request completions
- Authentication events

### DEBUG (3)
Detailed debugging information:
- Request details
- Performance metrics
- Database operations
- Middleware execution

### TRACE (4)
Very detailed tracing information:
- Function entry/exit
- Variable values
- Internal state changes

## Configuration

### Environment Variables

Set the log level using the `LOG_LEVEL` environment variable:

```bash
# In your .env file
LOG_LEVEL=DEBUG

# Or when starting the server
LOG_LEVEL=INFO npm run server
```

### Default Settings

- **Default Log Level**: INFO
- **Log Rotation**: Every 2 days
- **Log Retention**: 30 days
- **Log Directory**: `server/logs/`

## Usage

### Viewing Logs

#### Basic Commands
```bash
# View available log files
npm run logs:view

# View today's logs
npm run logs:today

# View yesterday's logs
npm run logs:yesterday

# View only errors
npm run logs:errors

# View log statistics
npm run logs:stats
```

#### Advanced Filtering
```bash
# View specific log file
npm run logs:view -- --file clipchain-2024-01-15.log

# Filter by log level
npm run logs:view -- --level ERROR

# Search for specific text
npm run logs:view -- --search "database"

# Show only slow operations
npm run logs:view -- --slow

# Show only authentication events
npm run logs:view -- --auth

# Show last 50 lines
npm run logs:view -- --recent 50
```

### Programmatic Usage

```javascript
import logger from './utils/logger.js';

// Basic logging
logger.info('Server started successfully');
logger.warn('High memory usage detected');
logger.error('Database connection failed', { error: error.message });

// Specialized logging methods
logger.serverStart(3000, 'development');
logger.databaseConnected('mongodb://localhost:27017/clipchain');
logger.authenticationSuccess('user123', 'john_doe');
logger.performanceMetric('database_query', 1500, { collection: 'users' });
```

## Log Format

Each log entry follows this format:
```
[2024-01-15T10:30:45.123Z] [INFO ] 🚀 Server starting | {"port":3000,"environment":"development"}
```

### Components
- **Timestamp**: ISO 8601 format
- **Level**: 5-character log level
- **Message**: Human-readable message with emojis
- **Data**: Optional JSON data (separated by `|`)

## Monitoring and Alerts

### Performance Monitoring

The system automatically logs:
- Request response times
- Database operation durations
- Slow operations (>1 second) as warnings

### Authentication Monitoring

Track all authentication events:
- Successful logins
- Failed login attempts
- Token refreshes
- Logout events

### Error Tracking

Comprehensive error logging includes:
- Error message and stack trace
- Request context (method, URL, IP)
- User agent and request details
- Timestamp and severity

## Maintenance

### Automatic Cleanup

- Logs older than 30 days are automatically deleted
- No manual intervention required
- Disk space is automatically managed

### Manual Cleanup

If you need to manually clean logs:

```bash
# Remove all log files (use with caution)
rm -rf server/logs/*.log

# Remove specific date range
find server/logs -name "clipchain-*.log" -mtime +30 -delete
```

## Troubleshooting

### Common Issues

1. **Logs not being written**
   - Check if `server/logs/` directory exists
   - Verify file permissions
   - Check available disk space

2. **High log volume**
   - Reduce log level (e.g., from DEBUG to INFO)
   - Check for repeated errors or warnings
   - Review log rotation settings

3. **Performance impact**
   - Logging is asynchronous and shouldn't impact performance
   - If issues occur, check disk I/O performance

### Debug Mode

Enable debug logging to troubleshoot logging issues:

```bash
LOG_LEVEL=DEBUG npm run server
```

## Integration with Existing Code

The logging system is designed to work seamlessly with existing code:

- **Console.log statements**: Can be gradually replaced with logger calls
- **Error handling**: Automatically enhanced with structured logging
- **Performance monitoring**: Automatic without code changes
- **Request tracking**: Automatic for all Express routes

## Best Practices

1. **Use appropriate log levels**
   - ERROR: Only for actual errors
   - WARN: For concerning but non-critical issues
   - INFO: For important business events
   - DEBUG: For development debugging
   - TRACE: For detailed troubleshooting

2. **Include relevant context**
   - User IDs for user-related events
   - Request details for API calls
   - Performance metrics for operations

3. **Avoid logging sensitive data**
   - Never log passwords or tokens
   - Be careful with user personal information
   - Use data masking when necessary

4. **Monitor log volume**
   - Check log file sizes regularly
   - Monitor disk space usage
   - Adjust log levels as needed

## Examples

### User Authentication
```javascript
// Successful login
logger.authenticationSuccess(userId, username);

// Failed login
logger.authenticationFailure(username, { reason: 'Invalid password' });

// Logout
logger.info('🔓 User logged out', { userId, username });
```

### Database Operations
```javascript
const startTime = Date.now();
const result = await User.findById(userId);
const duration = Date.now() - startTime;

logger.performanceMetric('user_lookup', duration, { userId });
```

### API Requests
```javascript
// Request received (automatic)
// Request completed (automatic)
// Performance metrics (automatic)
```

## Support

For logging system issues or questions:
1. Check the log files for error messages
2. Verify environment variable configuration
3. Check file permissions and disk space
4. Review the troubleshooting section above
