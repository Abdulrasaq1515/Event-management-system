-- Update existing user profile to Rasaq Ajape
-- Run this on Railway MySQL database

UPDATE user_profiles 
SET 
  email = 'rasaq.ajape@example.com',
  first_name = 'Rasaq',
  last_name = 'Ajape',
  display_name = 'Rasaq Ajape',
  updated_at = NOW()
WHERE id = 'dev-user-123';

-- Verify the update
SELECT id, email, first_name, last_name, display_name, role, created_at, updated_at 
FROM user_profiles 
WHERE id = 'dev-user-123';
