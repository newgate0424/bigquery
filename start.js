#!/usr/bin/env node

/**
 * 170sa Analytics - Production Server Launcher
 * This script starts the Next.js application in production mode
 */

const { spawn } = require('child_process');
const path = require('path');

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting 170sa Analytics in production mode...\n');

// Start the application
const child = spawn('node', ['app.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  child.kill('SIGINT');
});