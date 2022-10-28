const pool = require('../DB_Config/Config');
const ObjectsToCsv = require('objects-to-csv');

module.exports.userReport = (req, res) => {

    let query = {
        text: `select first_name, last_name, email, cellno, account_status, usertype from users WHERE usertype = 'admin'`,
        value: [req.body.user_id]
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
        return res.status(400).json({message: 'Internal Server Error'})
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
        return res.status(400).json({message: 'Internal Server Error'})
    });
}