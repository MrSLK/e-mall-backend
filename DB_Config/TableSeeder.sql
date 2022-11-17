--users TABLE
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cellno VARCHAR(10) UNIQUE NOT NULL,
    account_status boolean NOT NULL,
    usertype VARCHAR(10) NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

--mall TABLE
DROP TABLE IF EXISTS mall CASCADE;
CREATE TABLE mall(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

--Category TABLE
DROP TABLE IF EXISTS category CASCADE;
CREATE TABLE category(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    group_section VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

--Product TABLE
DROP TABLE IF EXISTS product CASCADE;
CREATE TABLE product(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    quantity INT NOT NULL,
    category_id INT NOT NULL,
    shop_id INT NOT NULL,
    picture_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY(category_id) REFERENCES category (id),
    FOREIGN KEY(shop_id) REFERENCES shop (id)
);

--shop TABLE
DROP TABLE IF EXISTS shop CASCADE;
CREATE TABLE shop(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mall_id INT[] NOT NULL,
    category_id INT[] NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

--Cards table
DROP TABLE IF EXISTS cards CASCADE;
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    card_number VARCHAR(17) NOT NULL, 
    exp_month INT NOT NULL, 
    exp_year INT NOT NULL, 
    cvv INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY(user_id) REFERENCES users (id)
);
-- Payment table
DROP TABLE IF EXISTS payment CASCADE;
CREATE TABLE payment (
    id SERIAL PRIMARY KEY,
    amount FLOAT NOT NULL,
    payment_status VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL, 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

--orders TABLE
DROP TABLE IF EXISTS CASCADE;
CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    shop_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY(user_id) REFERENCES users (id),
    FOREIGN KEY(shop_id) REFERENCES shop (id),
    FOREIGN KEY(product_id) REFERENCES product (id)
);

--cart TABLE 
-- DROP TABLE IF EXISTS cart CASCADE;
-- CREATE TABLE cart(
--     id SERIAL PRIMARY KEY,
--     product_id INT NOT NULL,
--     user_id INT NOT NULL,
--     price FLOAT NOT NULL,
--     total FLOAT NOT NULL,
--     quantity INT NOT NULL,
--     product_status VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
--     updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
--     FOREIGN KEY(product_id) REFERENCES product (id),
--     FOREIGN KEY(user_id) REFERENCES users (id)
-- );

--address TABLE
-- DROP TABLE IF EXISTS address CASCADE;
-- CREATE TABLE address(
--     id SERIAL PRIMARY KEY,
--     user_id INT NOT NULL,
--     address_type VARCHAR(255) NOT NULL,
--     street_address VARCHAR(255) NOT NULL,
--     suburb VARCHAR(255) NOT NULL,
--     city_or_town VARCHAR(255) NOT NULL,
--     province VARCHAR(255) NOT NULL,
--     postal_code VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
--     updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
--     FOREIGN KEY(user_id) REFERENCES users (id)
-- );



INSERT INTO shop (name, mall_id, category_id) VALUES ('Shoprite', ARRAY[1,2,3,4,5,6,7], ARRAY[14,15,11,10]);