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
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

--mall TABLE
DROP TABLE IF EXISTS mall CASCADE;
CREATE TABLE mall(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

--Category TABLE
DROP TABLE IF EXISTS category CASCADE;
CREATE TABLE category(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
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
    picture_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY(category_id) REFERENCES category (id)
);

--shop TABLE
DROP TABLE IF EXISTS shop CASCADE;
CREATE TABLE shop(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mall_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY(mall_id) REFERENCES mall (id),
    FOREIGN KEY(category_id) REFERENCES category (id)
);

--cart TABLE
DROP TABLE IF EXISTS cart CASCADE;
CREATE TABLE cart(
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    price FLOAT NOT NULL,
    total FLOAT NOT NULL,
    quantity INT NOT NULL,
    product_status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY(product_id) REFERENCES product (id),
    FOREIGN KEY(user_id) REFERENCES users (id)
);