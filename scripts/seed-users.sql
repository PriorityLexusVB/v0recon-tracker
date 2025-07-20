-- Seed script to create initial users
-- Run this after setting up the database

INSERT INTO User (id, name, email, role, department, phone, isActive, createdAt, updatedAt) VALUES
('admin-1', 'Sarah Wilson', 'admin@dealership.com', 'ADMIN', 'IT', '555-0101', true, datetime('now'), datetime('now')),
('manager-1', 'John Smith', 'manager@dealership.com', 'MANAGER', 'Service', '555-0102', true, datetime('now'), datetime('now')),
('tech-1', 'Mike Johnson', 'tech@dealership.com', 'TECHNICIAN', 'Service', '555-0103', true, datetime('now'), datetime('now')),
('tech-2', 'Lisa Davis', 'lisa@dealership.com', 'TECHNICIAN', 'Service', '555-0104', true, datetime('now'), datetime('now')),
('tech-3', 'Robert Brown', 'robert@dealership.com', 'TECHNICIAN', 'Detail', '555-0105', true, datetime('now'), datetime('now'));
