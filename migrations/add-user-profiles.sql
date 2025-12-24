-- Migration: Add user_profiles table
-- Run this on Railway MySQL database

CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  profile_picture VARCHAR(500),
  role ENUM('organizer', 'admin', 'user') DEFAULT 'organizer',
  bio TEXT,
  organization VARCHAR(200),
  website VARCHAR(500),
  social_links JSON,
  preferences JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_display_name (display_name)
);

-- Seed the mock user (Haley Carter)
INSERT INTO user_profiles (
  id, email, first_name, last_name, display_name, 
  role, preferences, created_at, updated_at, last_login_at
) VALUES (
  'dev-user-123',
  'haley.carter@example.com',
  'Haley',
  'Carter',
  'Haley Carter',
  'organizer',
  '{"emailNotifications": true, "theme": "system", "timezone": "UTC", "language": "en"}',
  NOW(),
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  updated_at = NOW(),
  last_login_at = NOW();

-- Verify the user was created
SELECT id, email, display_name, role, created_at FROM user_profiles WHERE email = 'haley.carter@example.com';
