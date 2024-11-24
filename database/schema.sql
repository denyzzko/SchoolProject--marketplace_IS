-- drop tables if they exist
DROP TABLE IF EXISTS CategoryProposal;
DROP TABLE IF EXISTS SelfPickingEvent;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Ordr;
DROP TABLE IF EXISTS Attribute;
DROP TABLE IF EXISTS Offer;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Usr;

-- create tables with ENUM types defined within the tables
CREATE TABLE Usr (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('admin', 'moderator', 'farmer', 'customer', 'registered') NOT NULL
);

CREATE TABLE Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_category INT,
    name VARCHAR(100) NOT NULL,
    image_path VARCHAR(255),
    CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_category)
        REFERENCES Category(category_id)
        ON DELETE CASCADE
);

CREATE TABLE Offer (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    type ENUM('sale', 'selfpick') NOT NULL,
    price DECIMAL(10, 2),
    quantity DECIMAL(6,3),
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE CASCADE
);

CREATE TABLE Attribute (
    attribute_id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    price_item INT,
    price_kg INT,
    origin ENUM('Czech Republic', 'Spain', 'England', 'Portugal', 'USA', 'Germany', 'Poland', 'Belgium') NOT NULL,
    date_of_harvest DATE NOT NULL,
    quantity DECIMAL(6,3),
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id) ON DELETE CASCADE
);

CREATE TABLE Ordr (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    offer_id INT NOT NULL,
    quantity DECIMAL(6,3),
    date DATE NOT NULL,
    status ENUM('pending', 'confirmed', 'rejected') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id) ON DELETE CASCADE
);

CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    offer_id INT NOT NULL,
    rating INT,
    comment TEXT,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id) ON DELETE CASCADE
);

CREATE TABLE SelfPickingEvent (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id) ON DELETE CASCADE
);

CREATE TABLE CategoryProposal (
    proposal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    parent_category_id INT NULL,
    proposal TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_category_id) REFERENCES Category(category_id) ON DELETE SET NULL
);
