const pool = require('../DB_Config/Config');

module.exports.addToCart = (req, res) => {

    console.log(req.body);

    let product_status = 'in-cart';

    let newQuery = {
        text: 'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
        value: [req.body.user_id, req.body.product_id]
    }

    pool.query(newQuery.text, newQuery.value).then((result) => {
        if (result.rowCount > 0) {

            return res.status(400).json({ error: 'Product already exists in cart' });
        } else {
            if (req.body.quantity > 0) {
                //product_status must either be 'in-cart' or 'checked-out' or 'paid' 
                let query = {
                    text: 'INSERT INTO cart (product_id, user_id, price, total, quantity, product_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    value: [req.body.product_id, req.body.user_id, req.body.price, req.body.total, req.body.quantity, product_status]
                }

                pool.query(query.text, query.value).then((response) => {
                    console.log("From insterting to cart:", response);
                    if (response.rowCount > 0) {

                        if (response.rows[0].quantity < req.body.quantity) {
                            return res.status(400).json({ message: 'Out of stock!' })

                        } else {
                            let thirdQuery = {
                                text: 'UPDATE product SET quantity = (SELECT quantity FROM product WHERE id = $1) - $2 WHERE id = $1',
                                value: [req.body.product_id, req.body.quantity]
                            }

                            pool.query(thirdQuery.text, thirdQuery.value).then((update) => {
                                if (update.rowCount > 0) {
                                    return res.status(200).json({ message: 'Product added to cart' });
                                } else {

                                }
                            }).catch((error) => {
                                console.log(error);
                            });
                        }

                    } else {
                        return res.status(400).json({ message: 'Failed to add product to cart' });
                    }
                }).catch((err) => { })
            } else {
                console.log(err);
                return res.status(400).json({ status: 'Quantity must be greater than zero!' });
            }
        }

    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Internal Server Error' });
    })
}

module.exports.getFromCart = (req, res) => {

    let query = {
        text: `SELECT cart.id, cart.product_id, cart.user_id, cart.price, cart.total, cart.quantity, cart.product_status, product.name 
        FROM cart INNER JOIN product 
        ON cart.product_id = product.id 
        WHERE cart.user_id = $1 
        AND cart.product_status = 'in-cart'`,
        value: [req.body.user_id]
    }

    pool.query(query.text, query.value).then((response) => {

        if (response.rowCount > 0) {
            return res.status(200).json(response.rows);
        } else {
            return res.status(400).json({ message: 'Cart empty!' });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Internal Server Error' });
    });
}

module.exports.changeCartStatus = (req, res) => {

    let conditions;

    if (req.body.product_status === 'checked-out') {
        conditions = "SET product_status = 'checked-out', updated_at = NOW() WHERE product_status = 'in-cart'"
    } else if (req.body.product_status === 'paid') {
        conditions = "SET product_status = 'paid', updated_at = NOW() WHERE product_status = 'checked-out'"
    }

    let query = {
        text: `UPDATE cart ${conditions} AND user_id = $1`,
        value: [req.body.user_id]
    }

    pool.query(query.text, query.value).then((response) => {

        if (response.rowCount > 0) {
            return res.status(200).json(response.rows);
        } else {
            return res.status(400).json({ message: 'Proceed to payment!' });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Internal Server Error' });
    });
}

module.exports.removeFromCart = (req, res) => {

    let query = {
        text: `DELETE FROM cart WHERE user_id = $1 AND product_id = $2 AND product_status != 'paid'`,
        value: [req.body.user_id, req.body.product_id]
    }

    pool.query(query.text, query.value).then((response) => {
        if (response.rowCount > 0) {
            return res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to delete product!' });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Internal Server Error' });
    });
}


module.exports.proceedToCheckout = (req, res) => {
    console.log(req.body);

    let quantity = req.body.quantity, product_id = req.body.product_id, shop_id = req.body.Shop_id, newQantity;

    let query = {
        text: 'SELECT quantity FROM products WHERE id = $1 AND shop_id = $2',
        value: [product_id, shop_id]
    }

    let addressStatus = {
        text: 'SELECT address FROM users WHERE id = $1',
        values: [req.body.user_id]
    }

    let updateQuantity = {
        text: 'UPDATE products SET quantity = $3 WHERE id = $1 AND shop_id = $2',
        value: [req.body.product_id, shop_id, newQantity]
    }

    let salesQuery = {
        text: 'INSERT INTO sales (user_id, product_id, shop_id, quantity) VALUES ($1, $2, $3, $4)',
        value: [req.body.user_id, req.body.product_id, req.body.shop_id, req.body.quantity]
    }

    pool.query(addressStatus.text, addressStatus.values).then((result) => {
        console.log(result);

        if (result.rows[0].address == null) {
            return res.status(400).json({ message: "Address cannot be null. Please update your address!" });
        }
        pool.query(query.text, query.value).then((response) => {
            console.log(response);
            if (quantity > response.rows[0].quantity) {
                return res.status(400).json({ message: "We don't have enough stock for this purchase!" });
            }
            newQantity = response.rows[0].quantity - quantity;

            pool.query(updateQuantity.text, updateQuantity.value).then((results) => {
                console.log(results);

                if (results.rowCount > 0) {
                    pool.query(salesQuery.text, salesQuery.value).then((success) => {

                        if(success.rowCount > 0){
                            return res.status(200).json({ message: "Check out successful!" });
                        } else{
                            return res.status(400).json({ message: "Failed to save sales!" });
                        }
                    }).catch((error) => {
                        console.log(error);
                    });
                }
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({ message: 'Update quantity - Internal Server Error' });
            });

        }).catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Check product - Internal Server Error' });
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({ message: 'Check address - Internal Server Error' });
    });
}