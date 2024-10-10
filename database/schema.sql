-- drop tables
DROP TABLE IF EXISTS CategoryProposal;
DROP TABLE IF EXISTS SelfPickingEvent;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Ordr;
DROP TABLE IF EXISTS Attribute;
DROP TABLE IF EXISTS Offer;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Usr;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS offer_type;
DROP TYPE IF EXISTS origin_type;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS proposal_status;


-- create custom ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'farmer', 'customer');
CREATE TYPE offer_type AS ENUM ('sale', 'selfpick');
CREATE TYPE origin_type AS ENUM ('Czech Republic', 'Spain', 'England', 'Portugal', 'USA', 'Germany', 'Poland', 'Belgium');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered');
CREATE TYPE proposal_status AS ENUM ('pending', 'approved', 'rejected');

-- create tables
CREATE TABLE Usr (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role user_role NOT NULL
);

CREATE TABLE Category (
    category_id SERIAL PRIMARY KEY,
    parent_category INT,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (parent_category) REFERENCES Category(category_id) ON DELETE SET NULL
);

CREATE TABLE Offer (
    offer_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    type offer_type NOT NULL,
    price DECIMAL(10, 2), -- added price for offers
    quantity INT,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE CASCADE
);

CREATE TABLE Attribute (
    attribute_id SERIAL PRIMARY KEY,
    offer_id INT NOT NULL,
    price_item INT,
    price_kg INT,
    origin origin_type NOT NULL,
    date_of_harvest DATE NOT NULL,
    quantity INT,
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id) ON DELETE CASCADE
);

CREATE TABLE Ordr (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    offer_id INT NOT NULL,
    quantity INT NOT NULL,
    date DATE NOT NULL,
    status order_status NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id) ON DELETE CASCADE
);

CREATE TABLE Review (
    review_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    offer_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id) ON DELETE CASCADE
);

CREATE TABLE SelfPickingEvent (
    event_id SERIAL PRIMARY KEY,
    offer_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id) ON DELETE CASCADE
);

CREATE TABLE CategoryProposal (
    proposal_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    proposal TEXT NOT NULL,
    status proposal_status NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Usr(user_id) ON DELETE CASCADE
);