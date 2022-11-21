const pool = require('../DB_Config/Config');
const ObjectsToCsv = require('objects-to-csv');

module.exports.userReport = (req, res) => {

    console.log(req.params);
    let query = {
        text: `select first_name, last_name, email, cellno, account_status, usertype from users WHERE id != $1`,
        value: [req.params.user_id]
    }

    pool.query(query.text, query.value).then(async (result) => {
        console.log(result);
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
        console.log(result);
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

module.exports.salesReport = (req, res) => {

    let data = []
    let query = {
        text: 'select product_id, shop_id, quantity, totalDue from orders'
    }

    pool.query(query.text).then(async (result) => {

        let shop_name = [], product_name = []
        if (result.rowCount > 0) {

            for (let i = 0; i < result.rowCount; i++) {
                let  product_id = result.rows[i].product_id, shop_id = result.rows[i].shop_id;
                setTimeout(() => {

                    let productNameQuery = {
                        text: 'select name from product where id = ANY($1)',
                        value: [product_id]
                    }

                    pool.query(productNameQuery.text, productNameQuery.value).then((results) => {
                        console.log(results.rows);
                        product_name.push(results.rows);
                    }).catch((error) => {
                        console.log(error);
                    })

                    let shopNameQuery = {
                        text: 'select name from shop where id = ANY($1)',
                        value: [shop_id]
                    }

                    pool.query(shopNameQuery.text, shopNameQuery.value).then((success) => {
                        console.log(success.rows);
                        shop_name.push(success.rows);
                    }).catch((error) => {
                        console.log(error);
                    })

                    data.push({
                        quantity: result.rows[i].quantity,
                        shop_name: shop_name,
                        product_name: product_name,
                        totalDue: result.rows[i].totalDue
                    });
                }, 6000)
            }

            setTimeout(async () => {            


            // return res.status(200).json(data)
            const csv = new ObjectsToCsv(data);

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
