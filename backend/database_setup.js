console.log('Running database setup script...');

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  if (!process.env.DBHost || !process.env.DBUser || !process.env.DBPort || !process.env.DBPass || !process.env.DBName) {
    throw new Error(
      'Missing required environment variables:' +
        process.env.DBHost +
        ', ' +
        process.env.DBUser +
        ', ' +
        process.env.DBPort +
        ', ' +
        process.env.DBPass +
        ', ' +
        process.env.DBName
    );
  }

  const { DBHost: host, DBUser: user, DBPort: port, DBPass: password, DBName: database } = process.env;

  console.log('Database configuration:', { host, user, port, database });

  let initialConnection;
  try {
    initialConnection = await mysql.createConnection({
      host,
      user,
      port,
      password,
    });

    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log('Database created or already exists.');

    const pool = mysql.createPool({
      host,
      user,
      port,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const connection = await pool.getConnection();
    console.log('Connected to the database.');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      public_key TEXT NOT NULL,
      private_key TEXT NOT NULL);`);
    console.log('Users table created.');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Conversations (
      conversation_id INT PRIMARY KEY AUTO_INCREMENT,
      user1_id INT NOT NULL,
      user2_id INT NOT NULL,
      user1_key TEXT NOT NULL,
      user2_key TEXT NOT NULL,
      FOREIGN KEY (user1_id) REFERENCES Users (id),
      FOREIGN KEY (user2_id) REFERENCES Users (id));`);
    console.log('Conversations table created.');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Messages (
      message_id INT PRIMARY KEY AUTO_INCREMENT,
      conversation_id INT NOT NULL,
      sender_id INT NOT NULL,
      message_content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
    console.log('Messages table created.');
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    if (initialConnection) {
      await initialConnection.end();
    }
    process.exit(0);
  }
}

setupDatabase();

