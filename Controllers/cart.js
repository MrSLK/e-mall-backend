const pool = require('../DB_Config/Config');

module.exports.addToCart = (req, res) => {

    let product_status = 'in-cart';

    let newQuery = {
        text: 'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
        value: [req.body.user_id, req.body.product_id]
    }

    pool(newQuery.text, newQuery.value).then((result) => {
        if (result.rowCount > 0) {
        
            return res.status(400).json({ error:'Product already exists in cart' });
        } else {
            if (req.body.quantity > 0) {
                //product_status must either be 'in-cart' or 'checked-out' or 'paid' 
                let query = {
                    text: 'INSERT INTO cart (product_id, user_id, price, total, quantity, product_status, user_id ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    value: [req.body.product_id, req.body.user_id, req.body.price, req.body.total, req.body.quantity, product_status, req.body.product_status, req.body.user_id]
                }
        
                pool(query.text, query.value).then((response) =>{
                    if (response.rowCount > 0) {
                        return res.status(200).json({message: 'Product added to cart'});
                    } else {
                        return res.status(400).json({message: 'Failed to add product to cart'});
                    }
                }).catch((err) =>{})
            } else {
                console.log(err);
                return res.status(400).json({ status: 'Quantity must be greater than zero!' });
            }
        }

    }).catch((err) => {
        console.log(err);
        return res.status(400).json({message: 'Internal Server Error'});
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

    pool(query.text, query.value).then((response) => {

        if (response.rowCount > 0) {
            return res.status(200).json(response.rows);
        } else {
            return res.status(400).json({message: 'Cart empty!'});
        }
    }).catch((err) => {
        console.log(err); 
        return res.status(400).json({message: 'Internal Server Error'});
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

    pool(query.text, query.value).then((response) => {

        if (response.rowCount > 0) {
            return res.status(200).json(response.rows);
        } else {
            return res.status(400).json({message: 'Proceed to payment!'});
        }
    }).catch((err) => {
        console.log(err); 
        return res.status(400).json({message: 'Internal Server Error'});
});
}

module.exports.removeFromCart = (req, res) => {

    let query = {
        text: `DELETE FROM cart WHERE user_id = $1 AND product_id = $2 AND product_status != 'paid'`,
        value: [req.body.user_id, req.body.product_id]
    }

    pool(query.text, query.value).then((response) => {
        if (response.rowCount > 0) {
            return res.status(200).json({message: 'Product deleted successfully'});
        } else {
            return res.status(400).json({message: 'Failed to delete product!'});
        }
    }).catch((err) => {
        console.log(err); 
        return res.status(400).json({message: 'Internal Server Error'});
});
}