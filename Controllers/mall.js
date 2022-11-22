const pool = require('../DB_Config/Config');

module.exports.createMall = (req, res) => {

    let query = {
        text: 'INSERT INTO mall (name, location) VALUES ($1, $2)',
        value: [req.body.name, req.body.location]
    }

    let tester = {
        text: 'SELECT * FROM mall WHERE name  = $1',
        value: [req.body.name]
    }

    pool.query(tester.text, tester.value).then((result) => {
        if (result.rowCount <= 0){
            pool.query(query.text, query.value).then((response) => {
                if (response.rowCount > 0) {
                    return res.status(200).json({ msg: 'Mall created successfully'});
                } else {
                    return res.status(400).json({error: 'Failed to create mall'});
                }
            }).catch((err) => {
                console.log(err);
            });
        } else {
            return res.status(400).json({error: 'Mall already exists!'});
        }
    })
}

module.exports.getMalls = (req, res) => {

    let query = {
        text: 'SELECT * FROM mall'
    }

    pool.query(query.text).then((response) => {
        if (response.rowCount > 0) {
            return res.status(200).json(response.rows);
        } else {
            return res.status(400).json({error: 'Failed to get malls!'});
        }
    }).catch((err) => {
        console.log(err);
    });
}