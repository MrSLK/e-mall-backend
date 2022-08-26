require('dotenv').config();

const { Pool } = require('pg');

const conn_string = "postgres://mwgllixp:CK7lyBkeXU0zp9zR-xFJbxs-AvEE4fNl@jelani.db.elephantsql.com/mwgllixp";

pool = new Pool({

  connectionString: conn_string,
  ssl: {
    rejectUnauthorized: false
  }
  })

module.exports = pool;
