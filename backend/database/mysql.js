const mysql = require('mysql2/promise');

// DB configuration
const connection = mysql.createPool({
  host: process.env.DBHost,
  user: process.env.DBUser,
  password: process.env.DBPass,
  database: process.env.DBName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { connection };
