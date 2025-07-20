-- Create sample teams for testing
INSERT INTO Team (id, name, description, department, isActive, createdAt, updatedAt) VALUES
('team_shop_a', 'Shop Team Alpha', 'Primary shop team for vehicle processing', 'shop', 1, datetime('now'), datetime('now')),
('team_shop_b', 'Shop Team Beta', 'Secondary shop team for overflow', 'shop', 1, datetime('now'), datetime('now')),
('team_detail_1', 'Detail Team One', 'Main detailing team', 'detail', 1, datetime('now'), datetime('now')),
('team_detail_2', 'Detail Team Two', 'Express detailing team', 'detail', 1, datetime('now'), datetime('now')),
('team_photo_main', 'Photo Team Main', 'Primary photography team', 'photo', 1, datetime('now'), datetime('now')),
('team_sales_floor', 'Sales Floor Team', 'Sales department team', 'sales', 1, datetime('now'), datetime('now'));

-- Assign existing users to teams (update based on your actual user IDs)
UPDATE User SET teamId = 'team_shop_a' WHERE department = 'shop' AND email LIKE '%1%';
UPDATE User SET teamId = 'team_shop_b' WHERE department = 'shop' AND email LIKE '%2%';
UPDATE User SET teamId = 'team_detail_1' WHERE department = 'detail' AND email LIKE '%1%';
UPDATE User SET teamId = 'team_detail_2' WHERE department = 'detail' AND email LIKE '%2%';
UPDATE User SET teamId = 'team_photo_main' WHERE department = 'photo';
UPDATE User SET teamId = 'team_sales_floor' WHERE department = 'sales';

-- Create some sample vehicle assignments
INSERT INTO VehicleAssignment (id, vin, teamId, status, priority, dueDate, notes, createdAt, updatedAt) VALUES
('assign_1', '1HGBH41JXMN109186', 'team_shop_a', 'assigned', 'high', date('now', '+3 days'), 'Rush job for customer pickup', datetime('now'), datetime('now')),
('assign_2', '1HGBH41JXMN109187', 'team_shop_a', 'in_progress', 'normal', date('now', '+5 days'), 'Standard processing', datetime('now'), datetime('now')),
('assign_3', '1HGBH41JXMN109188', 'team_detail_1', 'assigned', 'urgent', date('now', '+1 day'), 'VIP customer vehicle', datetime('now'), datetime('now')),
('assign_4', '1HGBH41JXMN109189', 'team_photo_main', 'assigned', 'normal', date('now', '+2 days'), 'Marketing photos needed', datetime('now'), datetime('now'));
