#!/usr/bin/env node

/**
 * Database initialization script for Railway deployment
 * This script pushes the database schema to the connected MySQL database
 */

const { execSync } = require('child_process');

console.log('🚀 Initializing database schema...');

try {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Make sure your Railway MySQL database is connected and DATABASE_URL is available');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL found');
  console.log('📊 Pushing database schema...');

  // Run drizzle-kit push to create/update database schema
  execSync('npm run db:push', { stdio: 'inherit' });

  console.log('✅ Database schema initialized successfully!');
  console.log('🎉 Your database is ready to use');

} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure your Railway MySQL database is running');
  console.log('2. Check that DATABASE_URL environment variable is set correctly');
  console.log('3. Verify your database connection settings');
  process.exit(1);
}