-- scripts/seed-users.sql

-- Insert sample users if they don't already exist
-- Passwords should be hashed in a real application. For seeding, we'll use a simple one.
-- Ensure you have a way to hash these passwords before deploying to production.

-- Admin User
INSERT INTO "User" (id, name, email, password, role, department, "createdAt", "updatedAt", "teamId")
VALUES
  ('user_admin_1', 'Admin User', 'admin@example.com', '$2a$10$abcdefghijklmnopqrstuvwxy', 'ADMIN', 'Management', NOW(), NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Manager User (Sales Team)
INSERT INTO "User" (id, name, email, password, role, department, "createdAt", "updatedAt", "teamId")
VALUES
  ('user_manager_1', 'Sales Manager', 'manager@example.com', '$2a$10$abcdefghijklmnopqrstuvwxy', 'MANAGER', 'Sales', NOW(), NOW(), 'team_sales_123')
ON CONFLICT (id) DO NOTHING;

-- Regular User (Service Team)
INSERT INTO "User" (id, name, email, password, role, department, "createdAt", "updatedAt", "teamId")
VALUES
  ('user_user_1', 'Service Tech', 'user@example.com', '$2a$10$abcdefghijklmnopqrstuvwxy', 'USER', 'Service', NOW(), NOW(), 'team_service_456')
ON CONFLICT (id) DO NOTHING;

-- Another Regular User (Detail Team)
INSERT INTO "User" (id, name, email, password, role, department, "createdAt", "updatedAt", "teamId")
VALUES
  ('user_user_2', 'Detail Specialist', 'detail@example.com', '$2a$10$abcdefghijklmnopqrstuvwxy', 'USER', 'Detail', NOW(), NOW(), 'team_detail_789')
ON CONFLICT (id) DO NOTHING;

-- Ensure the team IDs match those inserted in seed-teams.sql
