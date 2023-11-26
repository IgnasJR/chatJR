const mysql = require('mysql');

// DB configuration
const connection = mysql.createConnection({
  host: process.env.DBHost,
  user: process.env.DBUser,
  password: process.env.DBPass,
  database: process.env.DBName,
});

connection.connect((err) => {
  console.log(process.env.DBUser);
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = { connection };
