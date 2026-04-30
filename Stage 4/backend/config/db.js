const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('failed to connect with DB', err.message);
  } else {
    console.log('success to connect with DB');
    release();
  }
});

module.exports = pool;
