INSERT INTO Users (username, email, password_hash, profile_picture_path, phone_number)
VALUES
('admin_john', 'admin.john@homigo.com', 'hashed_pw_123', NULL, '{"encrypted":"7qEYPqRFbf3U6xbTgHj+UfZVwdWdJRdWuPHAZxShASXfYg==","iv":"1Z/0aeZ5ALYlukVx","tag":"kQ1Xva5AzlX8eyT+QoTwbg=="}'),
('landlord_maria', 'maria.landlord@homigo.com', 'hashed_pw_456', NULL, '{"encrypted":"32c7Yfb7RMPAugHlMGK9+FtYiGN4B0bKHvevbHdrRYPuRA==","iv":"JcMejCKS9ls38BJ2","tag":"5pWWiD/o6pBUHrw2p/taNw=="}'),
('tenant_bob', 'bob.tenant@homigo.com', 'hashed_pw_789', NULL, '{"encrypted":"m1/UvhA4vCtztm0/FJ2GUMiiEqLjtInL1K/BcdoYVoiXQg==","iv":"ju/rg8hSr8MZHTVp","tag":"EjxwIRVznKdwCnFSHHvF5g=="}'),
('tenant_alice', 'alice.tenant@homigo.com', 'hashed_pw_abc', NULL, '{"encrypted":"UDHQOSba6K/7qTHFzXtYtJDEp+U9jBG1UKgW7ctdqKqIiw==","iv":"gO5k+17RnreLictA","tag":"bnQTb+XMyRxzKqy68AeQFA=="}');

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
