const pool = require('../DB_Config/Config');

module.exports.createShop = (req, res) => {

  let query = {
    text: 'INSERT INTO shop (name, mall_id, category_id) VALUES ($1, $2, $3)',
    value: [req.body.name, req.body.mall_id, req.body.category_id]
  }

  let tester = {
    text: 'SELECT * FROM shop WHERE name  = $1',
    value: [req.body.name]
  }

  pool.query(tester.text, tester.value).then((result) => {
    if (result.rowCount <= 0) {
      pool.query(query.text, query.value).then((response) => {
        if (response.rowCount > 0) {
          return res.status(200).json({ msg: 'Shop created successfully' });
        } else {
          return res.status(400).json({ error: 'Shop to create mall' });
        }
      }).catch((err) => {
        console.log(err);
      });
    } else {
      return res.status(400).json({ error: 'Shop already exists!' });
    }
  })
}

module.exports.getShopsOfAMall = (req, res) => {

  let query = {
    text: `Select * from shop WHERE $1 = ANY(mall_id)`,
    value: [req.params.mall_id]
  }

  pool.query(query.text, query.value).then((response) => {
    if (response.rowCount > 0) {
      return res.status(200).json(response.rows);
    } else {
      return res.status(400).json({ error: 'Failed to get shops of this mall!' });
    }
  }).catch((err) => {
    console.log(err);
  });
}

module.exports.getShops = (req, res) => {

  let query = {
    text: 'SELECT * FROM shop'
  }

  pool.query(query.text).then((response) => {
    if (response.rowCount > 0) {
      return res.status(200).json(response.rows);
    } else {
      return res.status(400).json({ error: 'Failed to get shops!' });
    }
  }).catch((err) => {
    console.log(err);
  });
}