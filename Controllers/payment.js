const pool = require('../DB_Config/Config');

module.exports.saveCard = (req, res) => {

    let exp_date = req.body.exp_date;
    let exp_month = exp_date.substring(0, exp_date.indexOf("/")), exp_year = exp_date.substring(exp_date.indexOf("/") + 1)

    let query = {
        text: 'INSERT INTO cards (card_number, exp_month, exp_year, cvv, user_id) VALUES ($1, $2, $3, $4, $5)',
        value: [req.body.card_number, exp_month, exp_year, req.body.cvv, req.body.user_id]
    }
    pool.query(query.text, query.value).then((result) => {
        if(result.rowCount > 0){
            return res.status(201).json({msg: 'Successfully saved your card'});
        } else {
            return res.status(400).json({msg: 'Internal Server Error'});
        }
    }).catch((err) => {
        console.log(err);
    })
}