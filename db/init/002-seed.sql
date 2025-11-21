INSERT INTO Users (username, email, password_hash, profile_picture_path, phone_number)
VALUES
('admin_john', 'admin.john@homigo.com', 'hashed_pw_123', '/images/profiles/admin_john.jpg', '+1-555-111-2222'),
('landlord_maria', 'maria.landlord@homigo.com', 'hashed_pw_456', '/images/profiles/maria.jpg', '+1-555-333-4444'),
('tenant_bob', 'bob.tenant@homigo.com', 'hashed_pw_789', '/images/profiles/bob.jpg', '+1-555-555-6666'),
('tenant_alice', 'alice.tenant@homigo.com', 'hashed_pw_abc', NULL, '+1-555-777-8888');

INSERT INTO Listings (owner_id, title, description, price, address_country, address_province, address_city, address_zip_code, address_line1, address_line2, is_available)
VALUES
(2, 'Cozy Downtown Apartment', 'Modern 2-bedroom apartment near the city center.', 1200.00, 'USA', 'California', 'Los Angeles', '90001', '123 Main St', 'Apt 4B', TRUE),
(2, 'Spacious Suburban Home', 'A lovely 4-bedroom house with a big backyard.', 2500.00, 'USA', 'California', 'San Diego', '92101', '456 Oak Ave', NULL, TRUE),
(2, 'Studio Loft with Ocean View', 'Compact studio apartment overlooking the beach.', 950.00, 'USA', 'California', 'Santa Monica', '90401', '789 Beach Blvd', 'Unit 12', FALSE);

INSERT INTO ListingsImages (listing_id, path)
VALUES
(1, '/images/listings/1/living_room.jpg'),
(1, '/images/listings/1/bedroom.jpg'),
(2, '/images/listings/2/exterior.jpg'),
(3, '/images/listings/3/view.jpg');

INSERT INTO ListingFollowers (user_id, listing_id)
VALUES
(3, 1),
(3, 2),
(4, 1),
(4, 3);

INSERT INTO AuditLogs (user_id, action, ip_address)
VALUES
(1, 'Created new user landlord_maria', '192.168.1.10'),
(2, 'Published new listing: Cozy Downtown Apartment', '192.168.1.15'),
(3, 'Followed listing ID 1', '192.168.1.20'),
(4, 'Viewed listing ID 3', '192.168.1.25');
