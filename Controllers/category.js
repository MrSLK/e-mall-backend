const pool = require('../DB_Config/Config');

module.exports.createCategory = (req, res) => {

    let query = {
        text: 'INSERT INTO category (name, description) VALUES ($1, $2)',
        value: [req.body.name, req.body.description]
    }

    let tester = {
        text: 'SELECT * FROM category WHERE name  = $1',
        value: [req.body.name]
    }

    pool.query(tester.text, tester.value).then((result) => {
        if (result.rowCount < 0){
            pool.query(query.text, query.value).then((response) => {
                console.log(response);
                if (response.rowCount > 0) {
                    return res.status(200).json({ msg: 'Category created successfully'});
                } else {
                    return res.status(400).json({error: 'Failed to create category'});
                }
            }).catch((err) => {
                console.log(err);
            });
        } else {
            return res.status(400).json({error: 'Category already exists!'});
        }
    })
}

module.exports.getCategories = (req, res) => {

    let query = {
        text: 'SELECT * FROM category'
    }

    pool.query(query.text).then((response) => {
        console.log(response);
        if (response.rowCount > 0) {
            return res.status(200).json(response.rows);
        } else {
            return res.status(400).json({error: 'Failed to get categories!'});
        }
    }).catch((err) => {
        console.log(err);
    });
}


