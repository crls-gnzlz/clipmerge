#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '..', 'logs');

function showHelp() {
  console.log(`
📋 ClipChain Log Viewer
=======================

Usage: node viewLogs.js [options]

Options:
  --help, -h           Show this help message
  --file <filename>    View specific log file (e.g., clipchain-2024-01-15.log)
  --today             View today's log file
  --yesterday         View yesterday's log file
  --level <level>     Filter by log level (ERROR, WARN, INFO, DEBUG, TRACE)
  --search <text>     Search for specific text in logs
  --errors            Show only error logs
  --warnings          Show only warning logs
  --slow              Show only slow operations (>1s)
  --auth              Show only authentication events
  --recent <lines>    Show only the last N lines (default: 100)
  --stats             Show log statistics

Examples:
  node viewLogs.js --today
  node viewLogs.js --file clipchain-2024-01-15.log --level ERROR
  node viewLogs.js --search "database" --recent 50
  node viewLogs.js --errors --recent 20
  node viewLogs.js --stats
`);
}

function getLogFiles() {
  if (!fs.existsSync(logsDir)) {
    console.log('❌ No logs directory found. Run the server first to generate logs.');
    return [];
  }
  
  const files = fs.readdirSync(logsDir)
    .filter(file => file.endsWith('.log'))
    .sort()
    .reverse();
  
  return files;
}

function getTodayLogFile() {
  const today = new Date().toISOString().split('T')[0];
  return `clipchain-${today}.log`;
}

function getYesterdayLogFile() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  return `clipchain-${dateStr}.log`;
}

function parseLogLine(line) {
  const match = line.match(/^\[([^\]]+)\] \[([^\]]+)\] (.+)$/);
  if (!match) return null;
  
  const [, timestamp, level, message] = match;
  return { timestamp, level, message };
}

function filterLogs(logs, options) {
  let filtered = logs;
  
  if (options.level) {
    filtered = filtered.filter(log => log.level === options.level.toUpperCase());
  }
  
  if (options.search) {
    filtered = filtered.filter(log => 
      log.message.toLowerCase().includes(options.search.toLowerCase())
    );
  }
  
  if (options.errors) {
    filtered = filtered.filter(log => log.level === 'ERROR');
  }
  
  if (options.warnings) {
    filtered = filtered.filter(log => log.level === 'WARN');
  }
  
  if (options.slow) {
    filtered = filtered.filter(log => 
      log.message.includes('🐌 Slow operation detected')
    );
  }
  
  if (options.auth) {
    filtered = filtered.filter(log => 
      log.message.includes('🔐') || 
      log.message.includes('🔓') || 
      log.message.includes('❌') ||
      log.message.includes('🚫')
    );
  }
  
  return filtered;
}

function showLogStats(logs) {
  const stats = {
    total: logs.length,
    levels: {},
    errors: 0,
    warnings: 0,
    authEvents: 0,
    slowOperations: 0
  };
  
  logs.forEach(log => {
    stats.levels[log.level] = (stats.levels[log.level] || 0) + 1;
    
    if (log.level === 'ERROR') stats.errors++;
    if (log.level === 'WARN') stats.warnings++;
    if (log.message.includes('🔐') || log.message.includes('🔓')) stats.authEvents++;
    if (log.message.includes('🐌')) stats.slowOperations++;
  });
  
  console.log('\n📊 Log Statistics');
  console.log('=================');
  console.log(`Total entries: ${stats.total}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Warnings: ${stats.warnings}`);
  console.log(`Auth events: ${stats.authEvents}`);
  console.log(`Slow operations: ${stats.slowOperations}`);
  
  console.log('\nBy level:');
  Object.entries(stats.levels).forEach(([level, count]) => {
    console.log(`  ${level}: ${count}`);
  });
}

function viewLogs(options) {
  let targetFile = options.file;
  
  if (options.today) {
    targetFile = getTodayLogFile();
  } else if (options.yesterday) {
    targetFile = getYesterdayLogFile();
  }
  
  if (!targetFile) {
    const files = getLogFiles();
    if (files.length === 0) return;
    
    console.log('📁 Available log files:');
    files.forEach((file, index) => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      console.log(`  ${index + 1}. ${file} (${size} KB)`);
    });
    
    console.log('\n💡 Use --file <filename> to view a specific log file');
    console.log('💡 Use --today or --yesterday for recent logs');
    return;
  }
  
  const filePath = path.join(logsDir, targetFile);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Log file not found: ${targetFile}`);
    return;
  }
  
  console.log(`📖 Viewing log file: ${targetFile}`);
  console.log('=' .repeat(50));
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  let logs = lines.map(line => parseLogLine(line)).filter(log => log);
  
  if (options.stats) {
    showLogStats(logs);
    return;
  }
  
  // Apply filters
  logs = filterLogs(logs, options);
  
  // Apply line limit
  if (options.recent) {
    logs = logs.slice(-parseInt(options.recent));
  }
  
  if (logs.length === 0) {
    console.log('No logs found matching the criteria.');
    return;
  }
  
  logs.forEach(log => {
    const colors = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      DEBUG: '\x1b[35m',
      TRACE: '\x1b[37m'
    };
    
    const reset = '\x1b[0m';
    const color = colors[log.level] || '';
    
    console.log(`${color}[${log.level}]${reset} ${log.message}`);
  });
  
  console.log(`\n📊 Showing ${logs.length} of ${lines.length} total log entries`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--file':
        options.file = args[++i];
        break;
      case '--today':
        options.today = true;
        break;
      case '--yesterday':
        options.yesterday = true;
        break;
      case '--level':
        options.level = args[++i];
        break;
      case '--search':
        options.search = args[++i];
        break;
      case '--errors':
        options.errors = true;
        break;
      case '--warnings':
        options.warnings = true;
        break;
      case '--slow':
        options.slow = true;
        break;
      case '--auth':
        options.auth = true;
        break;
      case '--recent':
        options.recent = args[++i];
        break;
      case '--stats':
        options.stats = true;
        break;
    }
  }
  
  return options;
}

// Main execution
const options = parseArgs();

if (options.help) {
  showHelp();
} else {
  viewLogs(options);
}
