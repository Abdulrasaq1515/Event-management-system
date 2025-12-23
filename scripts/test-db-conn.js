#!/usr/bin/env node
/**
 * Simple script to test MySQL connectivity using DATABASE_URL env var.
 * Usage:
 *   DATABASE_URL="mysql://..." node ./scripts/test-db-conn.js
 */
const mysql = require('mysql2/promise');

(async () => {
  const url = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
  if (!url) {
    console.error('ERROR: No DATABASE_URL / MYSQL_PUBLIC_URL / MYSQL_URL provided in env');
    process.exit(1);
  }

  try {
    console.log('Testing DB connection to:', url.replace(/:\/\/.*?:.*?@/, '://[REDACTED]@'));
    const conn = await mysql.createConnection(url);
    const [rows] = await conn.query('SELECT 1 AS ok');
    console.log('OK - DB reachable:', rows[0]);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message || err);
    process.exit(2);
  }
})();
