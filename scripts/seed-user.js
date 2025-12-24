/**
 * Seed script to create a mock user profile in the database
 * Run with: node scripts/seed-user.js
 */

const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function seedUser() {
  console.log('🌱 Seeding user profile...');

  // Create connection
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM user_profiles WHERE email = ?',
      ['rasaq.ajape@example.com']
    );

    if (existingUsers.length > 0) {
      console.log('✅ User already exists');
      await connection.end();
      return;
    }

    // Insert mock user
    await connection.execute(
      `INSERT INTO user_profiles (
        id, email, first_name, last_name, display_name, 
        role, preferences, created_at, updated_at, last_login_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        'dev-user-123',
        'rasaq.ajape@example.com',
        'Rasaq',
        'Ajape',
        'Rasaq Ajape',
        'organizer',
        JSON.stringify({
          emailNotifications: true,
          theme: 'system',
          timezone: 'UTC',
          language: 'en'
        })
      ]
    );

    console.log('✅ User profile created successfully');
    console.log('📧 Email: rasaq.ajape@example.com');
    console.log('👤 Name: Rasaq Ajape');
    console.log('🔑 ID: dev-user-123');

  } catch (error) {
    console.error('❌ Error seeding user:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedUser()
  .then(() => {
    console.log('✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed user:', error);
    process.exit(1);
  });
