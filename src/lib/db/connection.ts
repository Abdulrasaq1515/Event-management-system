import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

function parseRailwayDatabaseUrl(url: string) {
  try {
    console.log('Parsing DATABASE_URL:', url.replace(/:[^:@]*@/, ':***@'));
    
    if (url.includes('mysql://')) {
      const parsed = new URL(url);
      const databaseName = parsed.pathname.slice(1);
      
      const config = {
        host: parsed.hostname,
        port: parseInt(parsed.port) || 3306,
        user: parsed.username,
        password: parsed.password,
        database: databaseName || 'railway',
        ssl: undefined,
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        multipleStatements: true,
        charset: 'utf8mb4',
      };
      
      console.log('Database config:', {
        ...config,
        password: config.password ? '[REDACTED]' : undefined
      });
      
      return config;
    }
    
    return url;
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    return {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'events_db',
      ssl: undefined,
    };
  }
}

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/events_db';
const connectionConfig = parseRailwayDatabaseUrl(databaseUrl);

console.log('Creating MySQL connection pool...');

const connection = mysql.createPool(connectionConfig);

export const db = drizzle(connection, { schema, mode: 'default' });

export async function testConnection(): Promise<boolean> {
  try {
    console.log('Testing database connection...');
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

export { connection };