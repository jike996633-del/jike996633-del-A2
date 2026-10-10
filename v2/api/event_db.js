const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'charityevents_a3',
  waitForConnections: true,
  connectionLimit: 5,
  timezone: '+00:00',
  dateStrings: true,
  decimalNumbers: true
});

// mysql2's timezone option formats dates; it does not set the MySQL session clock.
pool.on('connection', connection => {
  connection.query("SET time_zone = '+00:00'", error => {
    if (error) connection.destroy();
  });
});

module.exports = pool;
