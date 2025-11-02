-- ===================================
-- Sample Data for HomigoDB
-- ===================================

-- ROLES
INSERT INTO Roles (name)
VALUES ('Admin'), ('Landlord'), ('Tenant');

-- PASSWORDS (hashed examples)
INSERT INTO Passwords (hash)
VALUES 
('5f4dcc3b5aa765d61d8327deb882cf99'), -- "password"
('25d55ad283aa400af464c76d713c07ad'), -- "12345678"
('e10adc3949ba59abbe56e057f20f883e'); -- "123456"

-- PHONES
INSERT INTO PhonesNumbers (number)
VALUES 
('+1-202-555-0147'),
('+44-7700-900123'),
('+91-9876543210');

-- USER IMAGES
INSERT INTO UserImages (path)
VALUES 
('./images/users/john_doe.png'),
('./images/users/jane_smith.jpg'),
('./images/users/alex_lee.png');

-- USERS
INSERT INTO Users (name, surname, role_id, password_id, phone_number_id, image_id)
VALUES
('John', 'Doe', 1, 1, 1, 1),
('Jane', 'Smith', 2, 2, 2, 2),
('Alex', 'Lee', 3, 3, 3, 3);

-- POST IMAGES
INSERT INTO PostImages (path)
VALUES
('./images/posts/post1.jpg'),
('./images/posts/post2.jpg'),
('./images/posts/post3.jpg');

-- POSTS
INSERT INTO Posts (name, description, price, publication_date, image_id)
VALUES
('Apartment 1', 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.', 499.99, '2025-10-25', 1),
('Apartment 2', 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.', 2500.00, '2025-10-20', 2),
('Apartment 3', 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.', 890.50, '2025-10-15', 3);

-- All posts created by user 2
INSERT INTO PostOwner (user_id, post_id)
VALUES
(2, 1),  
(2, 2),  
(2, 3);  

-- Suppose post 2 is not followed by anyone
INSERT INTO PostFollower (user_id, post_id)
VALUES
(3, 1),  
(3, 3),  
