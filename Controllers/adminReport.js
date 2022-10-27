const pool = require('../DB_Config/Config');

module.exports.createReport = (req, res) => {

    let query = {
        text: 'select * from sales'
    }

    pool.query(query.text).then((result) => {
        console.log(result);
        if (result.rowCount > 0) {
            return res.status(201).json({sales: result.rows});
        } else {
            return res.status(200).json({ message: 'No sales found' });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({message: 'Internal Server Error'})
    });
}