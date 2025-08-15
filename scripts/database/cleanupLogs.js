#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '..', 'logs');

function showHelp() {
  console.log(`
🗑️ ClipChain Log Cleanup Script
================================

Usage: node cleanupLogs.js [options]

Options:
  --help, -h           Show this help message
  --dry-run            Show what would be deleted without actually deleting
  --days <number>      Delete logs older than N days (default: 30)
  --keep <number>      Keep only the last N log files
  --all                Delete all log files (use with caution!)
  --size               Show log file sizes and total storage used
  --compress           Compress old log files instead of deleting them

Examples:
  node cleanupLogs.js --dry-run --days 7
  node cleanupLogs.js --keep 10
  node cleanupLogs.js --size
  node cleanupLogs.js --compress --days 14
`);
}

function getLogFiles() {
  if (!fs.existsSync(logsDir)) {
    console.log('❌ No logs directory found.');
    return [];
  }
  
  return fs.readdirSync(logsDir)
    .filter(file => file.endsWith('.log'))
    .map(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
        daysOld: Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24))
      };
    })
    .sort((a, b) => b.mtime - a.mtime); // Newest first
}

function showLogSizes() {
  const files = getLogFiles();
  
  if (files.length === 0) {
    console.log('📁 No log files found.');
    return;
  }
  
  console.log('📊 Log File Sizes');
  console.log('==================');
  
  let totalSize = 0;
  files.forEach((file, index) => {
    const sizeKB = (file.size / 1024).toFixed(2);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
    
    console.log(`${index + 1}. ${file.name}`);
    console.log(`   Size: ${sizeStr}`);
    console.log(`   Age: ${file.daysOld} days old`);
    console.log(`   Modified: ${file.mtime.toLocaleDateString()}`);
    console.log('');
    
    totalSize += file.size;
  });
  
  const totalKB = (totalSize / 1024).toFixed(2);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  const totalStr = totalSize > 1024 * 1024 ? `${totalMB} MB` : `${totalKB} KB`;
  
  console.log(`💾 Total storage used: ${totalStr}`);
  console.log(`📁 Total files: ${files.length}`);
}

function cleanupByAge(days, dryRun = false) {
  const files = getLogFiles();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const filesToDelete = files.filter(file => file.mtime < cutoffDate);
  
  if (filesToDelete.length === 0) {
    console.log(`✅ No log files older than ${days} days found.`);
    return;
  }
  
  console.log(`🗑️ Found ${filesToDelete.length} log files older than ${days} days:`);
  filesToDelete.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`   - ${file.name} (${sizeKB} KB, ${file.daysOld} days old)`);
  });
  
  if (dryRun) {
    console.log('\n🔍 Dry run mode - no files will be deleted.');
    return;
  }
  
  console.log('\n🗑️ Deleting old log files...');
  let deletedSize = 0;
  let deletedCount = 0;
  
  filesToDelete.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      deletedSize += file.size;
      deletedCount++;
      console.log(`   ✅ Deleted: ${file.name}`);
    } catch (error) {
      console.log(`   ❌ Failed to delete: ${file.name} - ${error.message}`);
    }
  });
  
  const deletedKB = (deletedSize / 1024).toFixed(2);
  const deletedMB = (deletedSize / (1024 * 1024)).toFixed(2);
  const deletedStr = deletedSize > 1024 * 1024 ? `${deletedMB} MB` : `${deletedKB} KB`;
  
  console.log(`\n✅ Cleanup completed!`);
  console.log(`   Files deleted: ${deletedCount}`);
  console.log(`   Space freed: ${deletedStr}`);
}

function cleanupByCount(keepCount, dryRun = false) {
  const files = getLogFiles();
  
  if (files.length <= keepCount) {
    console.log(`✅ Only ${files.length} log files found, keeping all.`);
    return;
  }
  
  const filesToDelete = files.slice(keepCount);
  
  console.log(`🗑️ Found ${filesToDelete.length} log files to delete (keeping ${keepCount} newest):`);
  filesToDelete.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`   - ${file.name} (${sizeKB} KB, ${file.daysOld} days old)`);
  });
  
  if (dryRun) {
    console.log('\n🔍 Dry run mode - no files will be deleted.');
    return;
  }
  
  console.log('\n🗑️ Deleting old log files...');
  let deletedSize = 0;
  let deletedCount = 0;
  
  filesToDelete.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      deletedSize += file.size;
      deletedCount++;
      console.log(`   ✅ Deleted: ${file.name}`);
    } catch (error) {
      console.log(`   ❌ Failed to delete: ${file.name} - ${error.message}`);
    }
  });
  
  const deletedKB = (deletedSize / 1024).toFixed(2);
  const deletedMB = (deletedSize / (1024 * 1024)).toFixed(2);
  const deletedStr = deletedSize > 1024 * 1024 ? `${deletedMB} MB` : `${deletedKB} KB`;
  
  console.log(`\n✅ Cleanup completed!`);
  console.log(`   Files deleted: ${deletedCount}`);
  console.log(`   Space freed: ${deletedStr}`);
}

function deleteAllLogs(dryRun = false) {
  const files = getLogFiles();
  
  if (files.length === 0) {
    console.log('✅ No log files to delete.');
    return;
  }
  
  console.log(`⚠️  WARNING: This will delete ALL ${files.length} log files!`);
  
  if (dryRun) {
    console.log('🔍 Dry run mode - no files will be deleted.');
    return;
  }
  
  console.log('\n🗑️ Deleting all log files...');
  let deletedSize = 0;
  let deletedCount = 0;
  
  files.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      deletedSize += file.size;
      deletedCount++;
      console.log(`   ✅ Deleted: ${file.name}`);
    } catch (error) {
      console.log(`   ❌ Failed to delete: ${file.name} - ${error.message}`);
    }
  });
  
  const deletedKB = (deletedSize / 1024).toFixed(2);
  const deletedMB = (deletedSize / (1024 * 1024)).toFixed(2);
  const deletedStr = deletedSize > 1024 * 1024 ? `${deletedMB} MB` : `${deletedKB} KB`;
  
  console.log(`\n✅ All logs deleted!`);
  console.log(`   Files deleted: ${deletedCount}`);
  console.log(`   Space freed: ${deletedStr}`);
}

function compressOldLogs(days) {
  console.log('⚠️  Compression feature not yet implemented.');
  console.log('💡 Use --days option to delete old logs instead.');
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
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--days':
        options.days = parseInt(args[++i]);
        break;
      case '--keep':
        options.keep = parseInt(args[++i]);
        break;
      case '--all':
        options.all = true;
        break;
      case '--size':
        options.size = true;
        break;
      case '--compress':
        options.compress = true;
        break;
    }
  }
  
  return options;
}

// Main execution
const options = parseArgs();

if (options.help) {
  showHelp();
} else if (options.size) {
  showLogSizes();
} else if (options.all) {
  deleteAllLogs(options.dryRun);
} else if (options.keep) {
  cleanupByCount(options.keep, options.dryRun);
} else if (options.days) {
  cleanupByAge(options.days, options.dryRun);
} else if (options.compress) {
  compressOldLogs(options.days);
} else {
  // Default: cleanup logs older than 30 days
  cleanupByAge(30, options.dryRun);
}
