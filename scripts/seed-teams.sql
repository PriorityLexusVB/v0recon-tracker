-- scripts/seed-teams.sql

-- Insert sample teams if they don't already exist
INSERT INTO "Team" (id, name, "createdAt", "updatedAt")
VALUES
  ('team_sales_123', 'Sales Team', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Team" (id, name, "createdAt", "updatedAt")
VALUES
  ('team_service_456', 'Service Team', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Team" (id, name, "createdAt", "updatedAt")
VALUES
  ('team_detail_789', 'Detail Team', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- You can add more teams as needed
