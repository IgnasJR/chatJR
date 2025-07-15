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
        res.status(201).json({ message: 'Conversation added successfully', conversationId: result.conversationId });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Error creating conversation' });
    }
  });

  app.delete('/api/conversations', async (req, res) => {
    try {
      const userId = verifyJwt(req.headers.authorization);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { conversationId } = req.body;
      if (!conversationId) {
        return res.status(400).json({ error: 'No conversation ID provided' });
      }
      const result = await removeConversation({ userId, conversationId });
      if (result instanceof Error) {
        if (result.message === 'Conversation cannot be removed') {
          return res.status(403).json({ error: result.message });
        } else {
          return res.status(500).json({ error: result.message });
        }
      }
      res.status(200).json({ message: result });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
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
  app.get('/api/messages/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    const lastMessageId = parseInt(req.query.lastMessageId, 10) || 0;
    const userId = verifyJwt(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let query;
    let queryParams;
    if (lastMessageId === 0) {
      query = `
        SELECT * FROM (
          SELECT M.* FROM Messages M 
          JOIN Conversations C ON M.conversation_id = C.conversation_id 
          WHERE M.conversation_id = ? AND (C.user1_id = ? OR C.user2_id = ?) 
          ORDER BY M.message_id DESC LIMIT 30
        ) AS T ORDER BY T.message_id ASC;
      `;
      queryParams = [conversationId, userId, userId];
    } else {
      query = `
        SELECT M.* FROM Messages M 
        JOIN Conversations C ON M.conversation_id = C.conversation_id 
        WHERE M.conversation_id = ? AND (C.user1_id = ? OR C.user2_id = ?) 
        AND M.message_id < ? 
        ORDER BY M.message_id ASC LIMIT 30;`;
      queryParams = [conversationId, userId, userId, lastMessageId];
    }
    try {
      const [results] = await connection.execute(query, queryParams);
      res.json(results);
    } catch (error) {
      console.error('Error retrieving messages:', error);
      res.status(500).json({ error: 'Error retrieving messages' });
    }
  });

  // Add a new message
  app.post('/api/messages', async (req, res) => {
    try {
      const userId = verifyJwt(req.headers.authorization);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { conversationId, messageContent } = req.body;
      if (!messageContent || messageContent.trim().length === 0) {
        return res.status(400).json({ error: 'Messages cannot be empty' });
      }
      const query = 'INSERT INTO Messages (sender_id, conversation_id, message_content, created_at) VALUES (?, ?, ?, ?)';
      const values = [userId, conversationId, messageContent.trim(), new Date()];
      const [result] = await connection.execute(query, values);
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ error: 'Error adding message' });
    }
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
      const query = 'SELECT public_key AS user_key FROM Users WHERE username = ?';
      const [results] = await connection.execute(query, [req.params.username]);

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ public_key: results[0].user_key });
    } catch (error) {
      console.error('Error retrieving public key:', error);
      res.status(500).json({ error: 'Error retrieving public key' });
    }
  });
};

module.exports = { setupExpress };

