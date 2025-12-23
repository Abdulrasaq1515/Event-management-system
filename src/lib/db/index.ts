// Re-export database connection and schema
export { db, connection, testConnection, closeConnection } from './connection';
export * from './schema';

// Database utility functions
export async function initializeDatabase(): Promise<boolean> {
  try {
    const { testConnection } = await import('./connection');
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection established successfully');
      return true;
    } else {
      console.error('❌ Failed to establish database connection');
      return false;
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
}