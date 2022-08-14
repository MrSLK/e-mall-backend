require('dotenv').config();

const { Pool } = require('pg');

const conn_string = "postgres://ckekbhahtljfqg:f59ef4d071b186902545ceabe99747fbad8de932a46b42be3c4d3265abf260ad@ec2-44-205-112-253.compute-1.amazonaws.com:5432/d2goh8k85tjbn1";

pool = new Pool({

  connectionString: conn_string,
  ssl: {
    rejectUnauthorized: false
  }
  })

module.exports = pool;
