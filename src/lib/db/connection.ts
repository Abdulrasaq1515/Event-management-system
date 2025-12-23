import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

// Parse Railway DATABASE_URL which might be in different formats
function parseRailwayDatabaseUrl(url: string) {
  try {
    console.log('Parsing DATABASE_URL:', url.replace(/:[^:@]*@/, ':***@'));
    
    if (url.includes('mysql://')) {
      // Railway format: mysql://user:password@host:port/database
      const parsed = new URL(url);
      const databaseName = parsed.pathname.slice(1); // Remove leading slash
      
      const config = {
        host: parsed.hostname,
        port: parseInt(parsed.port) || 3306,
        user: parsed.username,
        password: parsed.password,
        database: databaseName || 'railway', // Ensure database name is not empty
        ssl: false, // Disable SSL for Railway MySQL
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        multipleStatements: true, // Allow multiple SQL statements
      };
      
      console.log('Database config:', {
        ...config,
        password: config.password ? '[REDACTED]' : undefined
      });
      
      return config;
    }
    
    // Fallback to direct URL
    return { 
      uri: url, 
      ssl: false,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      multipleStatements: true,
    };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    // Fallback configuration
    return {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'events_db',
      ssl: false,
    };
  }
}

// Create MySQL connection pool with Railway-compatible configuration
const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/events_db';
const connectionConfig = parseRailwayDatabaseUrl(databaseUrl);

console.log('Creating MySQL connection pool...');

const connection = mysql.createPool(connectionConfig);

// Create the Drizzle database instance
export const db = drizzle(connection, { schema, mode: 'default' });

// Connection utility functions
export async function testConnection(): Promise<boolean> {
  try {
    console.log('Testing database connection...');
    // Simple query to test the connection
    await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Error details:', {
      code: (error as any)?.code,
      errno: (error as any)?.errno,
      sqlState: (error as any)?.sqlState,
      message: (error as any)?.message
    });
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