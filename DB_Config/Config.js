require('dotenv').config();

const { Pool } = require('pg');

const conn_string = "postgres://kxjbpxblaomzaj:e892845037297fc1046a554449abab30332212a4882503f44e9260b340a5d97a@ec2-3-219-19-205.compute-1.amazonaws.com:5432/df8etq83s75mmd";

pool = new Pool({

  connectionString: conn_string,
  ssl: {
    rejectUnauthorized: false
  }
  })

module.exports = pool;
