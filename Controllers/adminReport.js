const pool = require('../DB_Config/Config');
const ObjectsToCsv = require('objects-to-csv');

module.exports.userReport = (req, res) => {

    console.log(req.params);
    let query = {
        text: `select first_name, last_name, email, cellno, account_status, usertype from users WHERE id != $1`,
        value: [req.params.user_id]
    }

    pool.query(query.text, query.value).then(async (result) => {
        if (result.rowCount > 0) {
            let data = result.rows;
            const csv = new ObjectsToCsv(data);

            // Save to file:
            await csv.toDisk('./Users.csv');

            return res.download("./Users.csv")
        } else {
            return res.status(200).json({ message: 'No users found' });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Internal Server Error' })
    });
}

module.exports.productReport = (req, res) => {

    let query = {
        text: 'select name, description, price, quantity, created_at from product'
    }

    pool.query(query.text).then(async (result) => {
        if (result.rowCount > 0) {
            let data = result.rows;
            const csv = new ObjectsToCsv(data);

            // Save to file:
            await csv.toDisk('./Products.csv');

            // return res.status(201).json({sales: result.rows});
            return res.download("./Products.csv")
        } else {
            return res.status(200).json({ message: 'No products found' });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Internal Server Error' })
    });
}

module.exports.productReportObject = (req, res) => {

    let query = {
        text: 'select name, description, price, quantity, created_at from product'
    }

    pool.query(query.text).then(async (result) => {
        if (result.rowCount > 0) {
            let data = result.rows;
            return res.status(200).json(data)
        } else {
            return res.status(200).json({ message: 'No products found' });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Internal Server Error' })
    });
}

module.exports.salesReport = (req, res) => {

    let data = {}
    let obj = []
    let query = {
        text: 'select product_id, shop_id, quantity, totaldue from orders'
    }

    pool.query(query.text).then(async (result) => {

        let shop_name = [], product_name = [], quantity = [], totaldue = []
        if (result.rowCount > 0) {

            for (let i = 0; i < result.rows.length; i++) {

                quantity[i] = result.rows[i].quantity
                totaldue[i] = result.rows[i].totaldue

                let productNameQuery = {
                    text: 'select name from product where id = ANY($1)',
                    value: [result.rows[i].product_id]
                }


                await pool.query(productNameQuery.text, productNameQuery.value).then((results) => {
                    for (let x = 0; x < results.rows.length; x++) {
                        product_name[i] = results.rows
                    }
                }).catch((err) => {
                    console.log(err);
                })

                //For Shop

                let shopNameQuery = {
                    text: 'select name from shop where id = ANY($1)',
                    value: [result.rows[i].shop_id]
                }
                await pool.query(shopNameQuery.text, shopNameQuery.value).then((success) => {
                    for (let x = 0; x < success.rows.length; x++) {
                        shop_name[i] = success.rows
                    }
                }).catch((err) => {
                    console.log(err);
                })
            }

            setTimeout(async () => {   
                    
                data.product_name = product_name
                data.shop_name = shop_name
                data.quantity = quantity
                data.totaldue = totaldue
                
                let newObj = []
                for (let a = 0; a < data.product_name.length; a++){
                    newObj[a] ={
                        product: data.product_name[a],
                        shop: data.shop_name[a],
                        quantity: data.quantity[a],
                        total: data.totaldue[a]
                    }
                }
                
                // return res.status(200).json(data)
                const csv = new ObjectsToCsv(newObj);

                // Save to file:
                await csv.toDisk('./sales.csv');

                // return res.status(201).json({sales: result.rows});
                return res.download("./sales.csv")
            }, 10000)

        } else {
            return res.status(200).json({ message: 'No products found' });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Internal Server Error' })
    });
}

module.exports.salesReportObject = (req, res) => {
    let data = {}
    let query = {
        text: 'select product_id, shop_id, quantity, totaldue from orders'
    }

    pool.query(query.text).then(async (result) => {

        let shop_name = [], product_name = [], quantity = [], totaldue = []
        if (result.rowCount > 0) {

            for (let i = 0; i < result.rows.length; i++) {

                quantity[i] = result.rows[i].quantity
                totaldue[i] = result.rows[i].totaldue

                let productNameQuery = {
                    text: 'select name from product where id = ANY($1)',
                    value: [result.rows[i].product_id]
                }


                await pool.query(productNameQuery.text, productNameQuery.value).then((results) => {
                    for (let x = 0; x < results.rows.length; x++) {
                        product_name[i] = results.rows
                    }
                }).catch((err) => {
                    console.log(err);
                })

                //For Shop

                let shopNameQuery = {
                    text: 'select name from shop where id = ANY($1)',
                    value: [result.rows[i].shop_id]
                }
                await pool.query(shopNameQuery.text, shopNameQuery.value).then((success) => {
                    for (let x = 0; x < success.rows.length; x++) {
                        shop_name[i] = success.rows
                    }
                }).catch((err) => {
                    console.log(err);
                })
            }

            setTimeout(async () => {   
                    
                data.product_name = product_name
                data.shop_name = shop_name
                data.quantity = quantity
                data.totaldue = totaldue
                return res.status(200).json(data)
            }, 10000)

        } else {
            return res.status(200).json({ message: 'No products found' });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Internal Server Error' })
    });
}