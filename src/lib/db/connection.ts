import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

// Parse Railway DATABASE_URL which might be in different formats
function parseRailwayDatabaseUrl(url: string) {
  try {
    // Handle Railway's MySQL URL format
    if (url.includes('mysql://')) {
      // Railway format: mysql://user:password@host:port/database
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port) || 3306,
        user: parsed.username,
        password: parsed.password,
        database: parsed.pathname.slice(1), // Remove leading slash
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      };
    }
    
    // Fallback to direct URL
    return { uri: url, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    // Fallback configuration
    return {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'events_db',
    };
  }
}

// Create MySQL connection pool with Railway-compatible configuration
const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/events_db';
const connectionConfig = parseRailwayDatabaseUrl(databaseUrl);

console.log('Database connection config:', {
  ...connectionConfig,
  password: connectionConfig.password ? '[REDACTED]' : undefined
});

const connection = mysql.createPool(connectionConfig);

// Create the Drizzle database instance
export const db = drizzle(connection, { schema, mode: 'default' });

// Connection utility functions
export async function testConnection(): Promise<boolean> {
  try {
    // Simple query to test the connection
    await db.execute(sql`SELECT 1`);
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  try {
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Export the connection for direct use if needed
export { connection };