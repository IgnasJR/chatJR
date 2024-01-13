const mysql = require('mysql');

// DB configuration
const connection = mysql.createPool({
  host: process.env.DBHost,
  user: process.env.DBUser,
  password: process.env.DBPass,
  database: process.env.DBName,
  connectionLimit: 10,
});

module.exports = { connection };
