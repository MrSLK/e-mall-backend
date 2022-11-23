const nodemailer = require('nodemailer'); //Send emails
const pool = require('../DB_Config/Config');

module.exports.addToCart = (req, res) => {

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

    let prod_quantity = 0, p = 0, quantity = req.body.quantity, product_id = req.body.product_id, shop_id = req.body.Shop_id, newQantity, totalDue = req.body.totalDue;

    let addressStatus = {
        text: 'SELECT address FROM users WHERE id = $1',
        values: [req.body.user_id]
    }

    let salesQuery = {
        text: 'INSERT INTO orders (user_id, product_id, shop_id, quantity, totalDue) VALUES ($1, $2, $3, $4, $5)',
        value: [req.body.user_id, req.body.product_id, req.body.shop_id, req.body.quantity, req.body.totalDue]
    }

    pool.query(addressStatus.text, addressStatus.values).then((result) => {

        if (result.rows[0].address == null) {
            return res.status(400).json({ message: "Address cannot be null. Please update your address!" });
        }

        for (let i = 0; i < product_id.length; i++) {
               
            let query = {
                text: 'SELECT quantity FROM product WHERE id = $1 AND shop_id = $2',
                value: [req.body.product_id[i], req.body.shop_id[i]]
            }

            pool.query(query.text, query.value).then((response) => {
                console.log(response);
                if (quantity[i] > response.rows[0].quantity) {
                    return res.status(400).json({ message: "We don't have enough stock for this purchase!" });
                }
                newQantity = response.rows[0].quantity - prod_quantity;

                let updateQuantity = {
                    text: 'UPDATE product SET quantity = $3 WHERE id = $1 AND shop_id = $2',
                    value: [req.body.product_id[i], req.body.shop_id[i], newQantity]
                }
    
                pool.query(updateQuantity.text, updateQuantity.value).then((results) => {
                    if(results.rowCount > 0){
                        p++;
                    }
                }).catch((err) => {
                    console.log(err);
                    return res.status(500).json({ message: 'Update quantity - Internal Server Error' });
                });
    
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({ message: 'Check product - Internal Server Error' });
            });
        }

       setTimeout(async () => {
        if(p > 0){
            
            await pool.query(salesQuery.text, salesQuery.value).then((success) => {
                if(success.rowCount > 0){
                    addCandidateMailer(req.body.email, req.body.fullName)
                    return res.status(200).json({ message: "Check out successful!" });
                } else{
                    return res.status(400).json({ message: "Failed to save sales!" });
                }
            }).catch((error) => {
                console.log(error);
            });
        } else{
            return res.status(404).json({ message: "Internal Server Error"});    
        }
       }, 5000)

    }).catch((err) => {
        console.log(err);
        return res.status(500).json({ message: 'Check address - Internal Server Error' });
    });
}



const Transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "mogaudavi@gmail.com",
        pass: "smawjbgpafbgyebl"
    },
    tls: {
        rejectUnauthorized: false
    }
});

const addCandidateMailer = (email, name) => {
    let mailOptions = {
        from: 'koenaite8@gmail.com', // sender address
        to: email, // list of receivers
        subject: 'Order Placed', // Subject line
        // text: text, // plain text body
        html:
            `<h3>Greetings ${name},</h3><br>
        <h3>Your order has been placed, expect delivery in the coming days!
         </h3>
         <br>kind Regards,<br>
         E-Mall Team
          </h3>`
        // html body
    };
    Transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log(err);
        }
    });
}