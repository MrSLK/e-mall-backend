const nodemailer = require('nodemailer'); //Send emails
const pool = require('../DB_Config/Config');

module.exports.proceedToCheckout = (req, res) => {

    let prod_quantity = 0, p = 0, quantity = req.body.quantity, product_id = req.body.product_id, shop_id = req.body.shop_id, newQantity, totalDue = req.body.totalDue;

    let addressStatus = {
        text: 'SELECT address FROM users WHERE id = $1',
        values: [req.body.user_id]
    }

    let salesQuery = {
        text: 'INSERT INTO orders (user_id, product_id, shop_id, quantity, totalDue) VALUES ($1, $2, $3, $4, $5)',
        value: [req.body.user_id, req.body.product_id, req.body.shop_id, req.body.quantity, req.body.totalDue]
    }

    pool.query(addressStatus.text, addressStatus.values).then(async (result) => {

        if (result.rows[0].address == null) {
            return res.status(400).json({ message: "Address cannot be null. Please update your address!" });
        }

        console.log(req.body);
        for (let i = 0; i < product_id.length; i++) {
            
            let query = {
                text: 'SELECT quantity FROM product WHERE id = $1 AND shop_id = $2',
                value: [req.body.product_id[i], req.body.shop_id[i]]
            }
            await pool.query(query.text, query.value).then(async (response) => {
                console.log("Line 163",response.rows);
                if (req.body.quantity[i] > response.rows[0].quantity) {
                    return res.status(400).json({ message: "We don't have enough stock for this purchase!" });
                }
                newQantity = response.rows[0].quantity - prod_quantity;

                let updateQuantity = {
                    text: 'UPDATE product SET quantity = $3 WHERE id = $1 AND shop_id = $2',
                    value: [req.body.product_id[i], req.body.shop_id[i], newQantity]
                }
    
                await pool.query(updateQuantity.text, updateQuantity.value).then((results) => {
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

       setTimeout(() => {
        if(p > 0){
            
            pool.query(salesQuery.text, salesQuery.value).then((success) => {
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