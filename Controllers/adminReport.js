const pool = require('../DB_Config/Config');
const ObjectsToCsv = require('objects-to-csv');

module.exports.userReport = (req, res) => {

  let query = {
    text: `select first_name, last_name, email, cellno, account_status, usertype from users WHERE id != $1`,
    value: [req.params.user_id]
  }

  pool.query(query.text, query.value).then(async (result) => {
    if (result.rowCount > 0) {
      let data = result.rows;
      for (let x = 0; x < data.length; x++) {
        if (data[x].account_status) {
          data[x].account_status = 'Active'
        } else {
          data[x].account_status = 'Not Active'
        }
      }
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
    text: 'select product_id, shop_id, quantity, totaldue, user_id from orders'
  }


  pool.query(query.text).then(async (result) => {

    let shop_name = [], product_name = [], quantity = [], totaldue = [], customer = []
    if (result.rowCount > 0) {

      for (let i = 0; i < result.rows.length; i++) {

        quantity[i] = result.rows[i].quantity
        totaldue[i] = result.rows[i].totaldue

        let nameQuery = {
          text: `SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users WHERE id = $1`,
          value: [result.rows[i].user_id]
        }

        await pool.query(nameQuery.text, nameQuery.value).then((allNames) => {
          customer[i] = allNames.rows[0].full_name
        }).catch((err) => {
          console.log(err);
        })

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
        data.customer = customer

        let newObj = []
        for (let a = 0; a < data.product_name.length; a++) {
          newObj[a] = {
            product: data.product_name[a],
            shop: data.shop_name[a],
            quantity: data.quantity[a],
            total: data.totaldue[a],
            customer: data.customer[a]
          }
        }

        let rows = [], row = {}, rest = {}
        newObj.forEach(element => {
          for (let b = 0; b < element.product.length; b++) {
            row = {
              product: element.product[b].name,
              shop: element.shop[b] ? element.shop[b].name : "",
              quantity: element.quantity[b],
              'Customer Name': element.customer,
              'Order Total': '',
            }

            rows.push(row)

          }
          rest = {
            product: "",
            shop: "",
            quantity: "",
            'Order Total': element.total,
          }
          rows.push(rest)
        });

        // return res.status(200).json(data)
        const csv = new ObjectsToCsv(rows);

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

module.exports.moneyAllocation = (req, res) => {

  let eachProduct = []
  let shops = []
  let report = []
  let myProfit = 0

  let query = {
    text: 'select product_id, quantity from orders'
  }

  pool.query(query.text).then(async (orders) => {
    for (let x = 0; x < orders.rows.length; x++) {
      for (p = 0; p < orders.rows[x].product_id.length; p++) {
        eachProduct.push({ productId: orders.rows[x].product_id[p], quantity: orders.rows[x].quantity[p] })
      }
    }

    const quantitiesByProductId = eachProduct.reduce((acc, obj) => {
      const { productId, quantity } = obj;
      if (acc[productId]) {
        acc[productId] += quantity;
      } else {
        acc[productId] = quantity;
      }
      return acc;
    }, {});

    setTimeout(async () => {
      // loop through each key/value
      for (let key in quantitiesByProductId) {

        let quantity = quantitiesByProductId[key]

        let prodQuery = {
          text: 'select product.name, product.shop_id, product.price, shop.name from product, shop where product.shop_id = shop.id AND product.id = $1',
          value: [key]
        }

        await pool.query(prodQuery.text, prodQuery.value).then((prodInformation) => {

          let shopObj = {
            shopName: prodInformation.rows[0].name,
            moneyMade: prodInformation.rows[0].price * quantity
          }
          shops.push(shopObj)
        }).catch((err) => {
          console.log(err)
          return res.status(400).send("Everything is not ok!. Check terminal")
        })
      }

      const moneyByShops = shops.reduce((acc, obj) => {
        const { shopName, moneyMade } = obj;
        if (acc[shopName]) {
          acc[shopName] += moneyMade;
        } else {
          acc[shopName] = moneyMade;
        }
        return acc;
      }, {});

      for (let key in moneyByShops) {
        let moneyWeMade = moneyByShops[key] * 0.08
        myProfit = myProfit + moneyWeMade
        let tempObj = {
          'Shop Name': key,
          'Money Made': parseFloat(moneyByShops[key]).toFixed(2),
          'Our Profit': parseFloat(moneyWeMade).toFixed(2)
        }
        report.push(tempObj);
      }
      report.push({
        'Shop Name': '',
        'Money Made': '',
        'Our Profit': ''
      })
      report.push({ 'Shop Name': '', 'Money Made': 'Total Profit', 'Our Profit': parseFloat(myProfit).toFixed(2) })
      const csv = new ObjectsToCsv(report);

      // Save to file:
      await csv.toDisk('./Money allocation.csv');

      return res.download("./Money allocation.csv")
    }, 10000)
  }).catch((err) => {
    console.log(err)
    return res.status(400).send("Everything is not ok!. Check terminal")
  })


}

module.exports.moneyAllocationObject = (req, res) => {

  let eachProduct = []
  let shops = []
  let report = []
  let myProfit = 0

  let query = {
    text: 'select product_id, quantity from orders'
  }

  pool.query(query.text).then(async (orders) => {
    for (let x = 0; x < orders.rows.length; x++) {
      for (p = 0; p < orders.rows[x].product_id.length; p++) {
        eachProduct.push({ productId: orders.rows[x].product_id[p], quantity: orders.rows[x].quantity[p] })
      }
    }

    const quantitiesByProductId = eachProduct.reduce((acc, obj) => {
      const { productId, quantity } = obj;
      if (acc[productId]) {
        acc[productId] += quantity;
      } else {
        acc[productId] = quantity;
      }
      return acc;
    }, {});

    setTimeout(async () => {
      // loop through each key/value
      for (let key in quantitiesByProductId) {
        let quantity = quantitiesByProductId[key]
        let prodQuery = {
          text: 'select product.name, product.shop_id, product.price, shop.name from product, shop where product.shop_id = shop.id AND product.id = $1',
          value: [key]
        }
        await pool.query(prodQuery.text, prodQuery.value).then((prodInformation) => {

          let shopObj = {
            shopName: prodInformation.rows[0].name,
            moneyMade: prodInformation.rows[0].price * quantity
          }
          shops.push(shopObj)
        }).catch((err) => {
          console.log(err)
          return res.status(400).send("Everything is not ok!. Check terminal")
        })
      }

      const moneyByShops = shops.reduce((acc, obj) => {
        const { shopName, moneyMade } = obj;
        if (acc[shopName]) {
          acc[shopName] += moneyMade;
        } else {
          acc[shopName] = moneyMade;
        }
        return acc;
      }, {});

      for (let key in moneyByShops) {
        let moneyWeMade = moneyByShops[key] * 0.08
        myProfit = myProfit + moneyWeMade
        let tempObj = {
          'shopName': key,
          'moneyMade': parseFloat(moneyByShops[key]).toFixed(2),
          'ourProfit': parseFloat(moneyWeMade).toFixed(2)
        }
        report.push(tempObj);
      }
      res.status(200).json({ data: report, systemProfit: parseFloat(myProfit).toFixed(2) })
    }, 10000)
  }).catch((err) => {
    console.log(err)
    return res.status(400).send("Everything is not ok!. Check terminal")
  })
}