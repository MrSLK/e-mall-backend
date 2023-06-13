const pool = require('../DB_Config/Config');

module.exports.createProduct = (req, res) => {
    //Save upload response to the db
    query = {
        text: 'INSERT INTO product (name, description, price, quantity, category_id, shop_id, picture_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        value: [req.body.name, req.body.description, req.body.price, req.body.quantity, req.body.category_id, req.body.shop_id, req.body.picture_url]
    }
    
    // DB query
    pool.query(query.text, query.value)
        .then(data => {
            if (data.rowCount > 0) 
            {
                //response
                return res.status(201).json(`Successfully added ${req.body.name}!`);

            } else { res.status(400).json('Product upload failed') }
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({error: 'Server error! Failed to upload product'});
        });

}

module.exports.getProducts = (req, res) => {

    let query = {
        text: 'select * from product where category_id = $1',
        value: [req.params.category_id]
    }

    if (req.params.category_id === undefined) {
        return res.status(400).json({message: 'Category cannot be empty! Please enter a category'});
    } else {
        pool.query(query.text, query.value).then((response => {
            if (response.rowCount > 0) {
                return res.status(200).json(response.rows)
            } else {
                return res.status(404).json({ message: 'No products found' });
            }
        })).catch((err) => {
            console.log(err);
            return res.status(400).json({ message: 'Server error' });
        });
    }
}

module.exports.getAllProducts = (req, res) => {

    let query = {
        text: 'select * from product'
    }

    pool.query(query.text).then((response => {
        if (response.rowCount > 0) {
            return res.status(200).json(response.rows)
        } else {
            return res.status(401).json({ message: 'No products found' });
        }
    })).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Server error' });
    });
}

module.exports.getAllProductsOfAShop = (req, res) => {

    let query = {
        text: 'select * from product where category_id IN (select unnest(category_id) from shop where id = $1)',
        value: [req.params.shop_id]
    }

    pool.query(query.text, query.value).then((response => {
        if (response.rowCount > 0) {
            return res.status(200).json(response.rows)
        } else {
            return res.status(400).json({ message: 'No products found' });
        }
    })).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Server error' });
    });
}

module.exports.getOneProduct = (req, res) => {

    const query = {
        text: `SELECT 
          product.id,
          product.name AS product_name, 
          product.description, 
          product.price, 
          product.quantity, 
          product.category_id,
          product.shop_id,
          product.picture_url,
          shop.name AS shop
        FROM product
        JOIN shop ON product.shop_id = shop.id
        WHERE product.name = $1`,
        value: [req.body.product_name]
      };

    pool.query(query.text, query.value).then(response => {
        console.log('response: ', response.rows)
        if (response) return res.status(200).json(response.rows)
            return res.status(400).json({ message: 'No products found' });
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Server error' });
    });
}
