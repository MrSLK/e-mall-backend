const pool = require('../DB_Config/Config');

module.exports.orderHistory = (req, res) => {

    let query = {
        text: 'select product_id, shop_id, quantity, totalDue from orders where user_id = $1',
        value: [req.body.user_id]
    }

    pool.query(query.text, query.value).then((result) => {

        let shop_name = [], product_name = []
        let data = []
        
        if (result.rowCount > 0) {

            for (let i = 0; i < result.rowCount; i++) {
                let product_id = result.rows[i].product_id, shop_id = result.rows[i].shop_id;

                    let productNameQuery = {
                        text: 'select name from product where id = ANY($1)',
                        value: [product_id]
                    }

                    pool.query(productNameQuery.text, productNameQuery.value).then((results) => {
                        product_name.push(results.rows);
                    }).catch((error) => {
                        console.log(error);
                    })

                    let shopNameQuery = {
                        text: 'select name from shop where id = ANY($1)',
                        value: [shop_id]
                    }

                    pool.query(shopNameQuery.text, shopNameQuery.value).then((success) => {
                        shop_name.push(success.rows);
                    }).catch((error) => {
                        console.log(error);
                    })

                    data.push({
                        quantity: result.rows[i].quantity,
                        shop_name,
                        product_name,
                        totalDue: result.rows[i].totalDue
                    });

                }
                return res.status(200).json({data});
        }
    }).catch((err) => {
        console.log(err);
    });
}