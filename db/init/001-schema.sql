

CREATE DATABASE HomigoDB;

USE HomigoDB;


-- Refering to the users...:

CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Passwords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hash VARCHAR(255) NOT NULL
);

CREATE TABLE PhonesNumbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(255) NOT NULL
);

CREATE TABLE UserImages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    path VARCHAR(255) NOT NULL
);

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    password_id INT NOT NULL,
    phone_number_id INT,
    image_id INT,
    FOREIGN KEY (role_id) REFERENCES Roles(id),
    FOREIGN KEY (password_id) REFERENCES Passwords(id),
    FOREIGN KEY (phone_number_id) REFERENCES PhonesNumbers(id),
    FOREIGN KEY (image_id) REFERENCES UserImages(id)
);




-- Refering to the posts...:

CREATE TABLE PostImages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    path VARCHAR(255) NOT NULL
);

CREATE TABLE Posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    publication_date DATE NOT NULL,
    image_id INT,
    FOREIGN KEY (image_id) REFERENCES PostImages(id)
);






-- Refering to the users-posts relationships...:

CREATE TABLE PostOwner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (post_id) REFERENCES Posts(id)
);

CREATE TABLE PostFollower (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (post_id) REFERENCES Posts(id)
);

