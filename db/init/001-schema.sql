-- Refering to the users...:

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'landlord', 'tenant') NOT NULL,
    profile_picture_path VARCHAR(255) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    phone_number VARCHAR(20) NOT NULL
);




-- Refering to the Listings...:

CREATE TABLE Listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    address_country VARCHAR(255),
    address_province VARCHAR(255),
    address_city VARCHAR(255),
    address_zip_code VARCHAR(16),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    publication_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(id)
);



-- Refering to images...:

CREATE TABLE ListingsImages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    path VARCHAR(255) NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES Listings(id)
);


-- Refering to the users-listing likings...:

CREATE TABLE ListingFollowers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    listing_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (listing_id) REFERENCES Listings(id)
);





-- Refering to logs...:

CREATE TABLE AuditLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
