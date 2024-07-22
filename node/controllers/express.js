/* eslint-disable object-curly-newline */

const { createJwt, verifyJwt } = require('../authentication/authentication');
const { connection } = require('../database/mysql');
const { createConversation, removeConversation } = require('../database/conversations');

const setupExpress = (app) => {
  // Create a new conversation
  app.post('/api/conversations', async (req, res) => {
    try {
      const userId = verifyJwt(req.headers.authorization);      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const { username, firstKey, secondKey } = req.body;
        if (!username || !firstKey || !secondKey) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const result = await createConversation({ userId, username, firstKey, secondKey });  
      if (result === 'Conversation already exists') {
        res.status(400).json({ error: 'Conversation already exists' });
      } else {
        res.status(201).json({ message: 'Conversation added successfully' });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Error creating conversation' });
    }
  });

  app.delete('/api/conversations', async (req, res) => {
    const userId = verifyJwt(req.headers.authorization);
    const { conversationId } = req.body;
    const result = await removeConversation({ userId, conversationId });
    if (result === Error('Error removing conversation')) {
      res.status(400).json({ error: result.message });
    } else if (result === Error('Conversation cannot be removed')) {
      res.status(403).json({ error: result.message });
    } else {
      res.status(201).json('Conversation removed successfully');
    }
  });

  app.post('/api/verify', async (req, res) => {
    const token = req.headers.authorization;
    const userId = verifyJwt(token);
    if (userId) {
      res.status(200).json({ userId });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Get all users you can talk to
  app.get('/api/conversations', async (req, res) => {
    try {
      const userId = verifyJwt(req.headers.authorization);
        if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const query = `
        SELECT 
          C.conversation_id, 
          U.username, 
          CASE
            WHEN C.user1_id = ? THEN C.user1_key
            WHEN C.user2_id = ? THEN C.user2_key
          END AS user_key
        FROM Conversations AS C
        INNER JOIN Users AS U ON (C.user1_id = U.id OR C.user2_id = U.id)
        WHERE ? IN (C.user1_id, C.user2_id)
          AND U.id <> ?;
      `;
        const [results] = await connection.execute(query, [userId, userId, userId, userId]);
  
      res.json(results);
    } catch (error) {
      console.error('Error retrieving conversations:', error);
      res.status(500).json({ error: 'Error retrieving conversations' });
    }
  });
  

  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password cannot be empty' });
      }
  
      const query = 'SELECT * FROM Users WHERE username = ?';
      const [results] = await connection.execute(query, [username]);
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      const user = results[0];
  
      if (user.password === password) {
        const token = createJwt(user);
        return res.json({ userId: user.id, token, privateKey: user.private_key, publicKey: user.public_key });
      } else {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error retrieving user' });
    }
  });

  // Get messages between two users
  app.get('/api/messages/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    const lastMessageId = req.query.lastMessageId || 0;
    const userId = verifyJwt(req.headers.authorization);

    let query;
    switch (lastMessageId) {
      case 0:
        query = `
        SELECT * FROM (
          SELECT M.* FROM Messages M 
          JOIN Conversations C ON M.conversation_id = C.conversation_id 
          WHERE M.conversation_id = ? AND (C.user1_id = ? OR C.user2_id = ?) 
          ORDER BY M.message_id DESC LIMIT 30
        ) AS T ORDER BY T.message_id ASC;`;
        break;
      default:
        query = `
        SELECT M.* FROM Messages M JOIN Conversations C 
        ON M.conversation_id = C.conversation_id 
        WHERE M.conversation_id = ? AND (C.user1_id = ? 
        OR C.user2_id = ?) AND M.message_id < ? 
        ORDER BY M.message_id ASC LIMIT 30;`;
    }
    connection.query(query, [conversationId, userId, userId, lastMessageId], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Error retrieving messages' });
      } else {
        res.json(results);
      }
    });
  });

  // Add a new message
  app.post('/api/messages', (req, res) => {
    const userId = verifyJwt(req.headers.authorization);
    const { conversationId, messageContent } = req.body;
    if (messageContent.length === 0) {
      res.status(400).json({ error: 'Messages cannot be empty' });
      return;
    }
    const query = 'INSERT INTO Messages (sender_id, conversation_id, message_content, created_at) VALUES (?, ?, ?, ?)';
    connection.query(query, [userId, conversationId, messageContent, new Date()], (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Error adding message' });
      } else {
        res.json({ id: result.insertId });
      }
    });
  });

  app.post('/api/register', async (req, res) => {
    try {
      const { username, password, publicKey, privateKey } = req.body;
  
      if (!username || !password || username.includes(' ') || password.includes(' ')) {
        return res.status(400).json({ error: 'Username and password cannot contain spaces and cannot be empty' });
      }
      const insertQuery = `
        INSERT INTO Users (username, password, public_key, private_key)
        SELECT ?, ?, ?, ?
        WHERE NOT EXISTS (
          SELECT * FROM Users WHERE username = ?)`;
      const [result] = await connection.execute(insertQuery, [username, password, publicKey, privateKey, username]);
      if (result.affectedRows === 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
      res.json({ id: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error registering a user' });
    }
  });
  

  app.get('/api/getPublicKey/:username', async (req, res) => {
    try {
      const query = 'SELECT public_key FROM Users WHERE username = ?';
      const [results] = await connection.execute(query, [req.params.username]);
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ public_key: results[0].public_key });
    } catch (error) {
      console.error('Error retrieving public key:', error);
      res.status(500).json({ error: 'Error retrieving public key' });
    }
  });
  
  
};

module.exports = { setupExpress };
