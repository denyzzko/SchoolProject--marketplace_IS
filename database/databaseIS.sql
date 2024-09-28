-- drop tables
DROP TABLE IF EXISTS CategoryProposal;
DROP TABLE IF EXISTS SelfPickingEvent;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Ordr;
DROP TABLE IF EXISTS Attribute;
DROP TABLE IF EXISTS ProductListing;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Usr;

-- create tables
CREATE TABLE Usr (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'moderator', 'farmer', 'customer') NOT NULL
);

CREATE TABLE Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_category INT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (parent_category) REFERENCES Category(category_id) ON DELETE SET NULL
);

CREATE TABLE ProductListing (
    productlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_quantity INT NOT NULL,
    type ENUM('sale', 'selfpick') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE CASCADE
);

CREATE TABLE Attribute (
    attribute_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    required BOOLEAN NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE CASCADE
);

CREATE TABLE Ordr (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    productlist_id INT NOT NULL,
    quantity INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (productlist_id) REFERENCES ProductListing(productlist_id) ON DELETE CASCADE
);

CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    productlist_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (productlist_id) REFERENCES ProductListing(productlist_id) ON DELETE CASCADE
);

CREATE TABLE SelfPickingEvent (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    productlist_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (productlist_id) REFERENCES ProductListing(productlist_id) ON DELETE CASCADE
);

CREATE TABLE CategoryProposal (
    proposal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    proposal TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE
);

-- populate tables 
INSERT INTO Usr (name, email, role) 
VALUES 
('Admin User', 'admin@example.com', 'admin'),
('Moderator User', 'moderator@example.com', 'moderator'),
('Farmer John', 'farmer.john@example.com', 'farmer'),
('Customer Jane', 'customer.jane@example.com', 'customer');

INSERT INTO Category (name, parent_category) 
VALUES 
('Fruits', NULL),
('Vegetables', NULL);

INSERT INTO Category (name, parent_category) 
VALUES 
('Tomato', 2),
('Apple', 1);

INSERT INTO Attribute (category_id, type, required) 
VALUES 
((SELECT category_id FROM Category WHERE name='Tomato'), 'Color', TRUE),
((SELECT category_id FROM Category WHERE name='Apple'), 'Weight (kg)', TRUE),
((SELECT category_id FROM Category WHERE name='Tomato'), 'Size', FALSE);

INSERT INTO ProductListing (user_id, category_id, price, available_quantity, type) 
VALUES 
((SELECT user_id FROM Usr WHERE name='Farmer John'), (SELECT category_id FROM Category WHERE name='Tomato'), 2.50, 100, 'sale'),
((SELECT user_id FROM Usr WHERE name='Farmer John'), (SELECT category_id FROM Category WHERE name='Apple'), 1.20, 150, 'selfpick');

INSERT INTO Ordr (user_id, productlist_id, quantity, date, status)
VALUES 
((SELECT user_id FROM Usr WHERE name='Customer Jane'), (SELECT productlist_id FROM ProductListing WHERE price=2.50), 10, '2024-09-27', 'confirmed');

INSERT INTO Review (user_id, productlist_id, rating, comment) 
VALUES 
((SELECT user_id FROM Usr WHERE name='Customer Jane'), (SELECT productlist_id FROM ProductListing WHERE price=2.50), 5, 'Great quality tomatoes! Highly recommend.');

INSERT INTO SelfPickingEvent (productlist_id, location, start_date, end_date) 
VALUES 
((SELECT productlist_id FROM ProductListing WHERE price=1.20), 'Farm 101, Apple Orchard', '2024-09-01', '2024-09-30');

INSERT INTO CategoryProposal (user_id, proposal, status) 
VALUES 
((SELECT user_id FROM Usr WHERE name='Customer Jane'), 'Add category for Organic Products', 'pending');

COMMIT;

-- testing queries
-- List All Users
SELECT * FROM Usr;

-- List All Categories
SELECT category_id, name, parent_category FROM Category;

-- List All Product Listings with User and Category
SELECT 
    P.productlist_id,
    P.price,
    P.available_quantity,
    P.type,
    U.name AS farmer,
    C.name AS category
FROM ProductListing P
JOIN Usr U ON P.user_id = U.user_id
JOIN Category C ON P.category_id = C.category_id;

-- List Orders with Customer Information
SELECT 
    O.order_id,
    O.quantity,
    O.date,
    O.status,
    U.name AS customer,
    P.price AS product_price,
    C.name AS category
FROM Ordr O
JOIN Usr U ON O.user_id = U.user_id
JOIN ProductListing P ON O.productlist_id = P.productlist_id
JOIN Category C ON P.category_id = C.category_id;

-- List All Reviews
SELECT 
    R.review_id,
    U.name AS reviewer,
    P.price AS product_price,
    R.rating,
    R.comment
FROM Review R
JOIN Usr U ON R.user_id = U.user_id
JOIN ProductListing P ON R.productlist_id = P.productlist_id;

-- List All Self-Picking Events
SELECT 
    E.event_id,
    P.price AS product_price,
    E.location,
    E.start_date,
    E.end_date
FROM SelfPickingEvent E
JOIN ProductListing P ON E.productlist_id = P.productlist_id;

-- List Category Proposals
SELECT 
    CP.proposal_id,
    U.name AS proposer,
    CP.proposal,
    CP.status
FROM CategoryProposal CP
JOIN Usr U ON CP.user_id = U.user_id;

-- List All Attributes for a Specific Category
SELECT 
    A.attribute_id,
    C.name AS category,
    A.type,
    A.required
FROM Attribute A
JOIN Category C ON A.category_id = C.category_id
WHERE C.name = 'Tomato';

-- Check Stock of Products
SELECT 
    P.productlist_id,
    C.name AS category,
    P.available_quantity
FROM ProductListing P
JOIN Category C ON P.category_id = C.category_id;

-- Find All Pending Category Proposals
SELECT 
    CP.proposal_id,
    U.name AS proposer,
    CP.proposal
FROM CategoryProposal CP
JOIN Usr U ON CP.user_id = U.user_id
WHERE CP.status = 'pending';