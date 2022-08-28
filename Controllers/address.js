const { log } = require('console');
const pool = require('../DB_Config/Config');

//Save address
module.exports.saveAddress = (req, res) => {

    let query = {
        text: `INSERT INTO address (
            user_id, 
            address_type, 
            street_address,
            suburb, 
            city_or_town, 
            province, 
            postal_code) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        value: [req.body.user_id, 
            req.body.address_type, 
            req.body.street_address,
            req.body.suburb, 
            req.body.city_or_town, 
            req.body.province, 
            req.body.postal_code]
    }

    pool.query(query.text, query.value).then((response) => {
        if (response.rowCount > 0) {
            return res.status(200).json({ msg: 'Addresses added successfully'});
        } else {
            return res.status(400).json({error: 'Failed to save address'});
        }
    }).catch((err) => {
        console.log(err);
    });
};

//Get address of a user
module.exports.getUserAddress = (req, res) => {
    
    let query = {
        text: `SELECT * FROM address WHERE user_id = $1`,
        value: [req.body.user_id]
    }

    pool.query(query.text, query.value).then((response) => {
        if (response.rowCount > 0) {
            return res.status(200).json(response.rows);
        } else {
            return res.status(400).json({error: 'No address found'});
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({error: 'Failed to get user address'});
    });
};

//Update address
module.exports.updateAddress = (req, res) => {

    let query = {
        text: `UPDATE address SET
        address_type = $2, 
        street_address = $3, 
        suburb = $4, 
        city_or_town = $5, 
        province = $6, 
        postal_code = $7,
        updated_at = NOW() WHERE
        user_id = $1`,
        value: [req.body.user_id, 
            req.body.address_type, 
            req.body.street_address, 
            req.body.suburb, 
            req.body.city_or_town, 
            req.body.province, 
            req.body.postal_code]
    }
    
    let tester = {
        text: 'SELECT * FROM address WHERE user_id = $1',
        value: [req.body.user_id]
    }

    pool.query(tester.text, tester.value).then((result) => {
        if (result.rowCount > 0) {
            pool.query(query.text, query.value).then((response) => {
                if (response.rowCount > 0) {
                    return res.status(200).json({ msg: 'Addresses updated successfully'});
                } else {
                    return res.status(400).json({error: 'Failed to update addresses'});
                }
            }).catch((err) => {
                console.log(err);
            });
        } else {
            return res.status(400).json({error: 'No addresses were found.'});
        }
    }).catch((err) => {});
};

//Delete address
module.exports.deleteAddress = (req, res) => {

    let query = {
        text: `DELETE FROM address  WHERE user_id = $1 AND address_id = $2`,
        value: [req.body.user_id, req.body.id]
    }

    pool.query(query.text, query.value).then((response) => {
        if (response.rowCount > 0) {
            return res.status(200).json({ msg: 'Addresses deleted successfully'});
        } else {
            return res.status(400).json({error: 'Failed to delete addresses'});
        }
    }).catch((err) => {
        console.log(err);
    });
};