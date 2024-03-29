/* eslint-disable object-curly-newline */

const { createJwt, verifyJwt } = require('../authentication/authentication');
const { connection } = require('../database/mysql');
const { createConversation, removeConversation } = require('../database/conversations');

const setupExpress = (app) => {
  // Create a new conversation
  app.post('/api/conversations', async (req, res) => {
    const userId = verifyJwt(req.headers.authorization);
    const { username, firstKey, secondKey } = req.body;
    if (!username) {
      res.status(400).json({ error: 'No username provided' });
      return;
    }
    const result = await createConversation({ userId, username, firstKey, secondKey });
    if (result === 'Conversation already exists') {
      res.status(400).json({ error: 'Conversation already exists' });
    } else {
      res.status(201).json('Conversation added successfully');
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
  app.get('/api/conversations', (req, res) => {
    const userId = verifyJwt(req.headers.authorization);
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

    connection.query(query, [userId, userId, userId, userId], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Error retrieving conversations' });
      } else {
        res.json(results);
      }
    });
  });

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM Users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Error retrieving user' });
      } else if (results.length === 0) {
        res.status(401).json({ error: 'Invalid username or password' });
      } else {
        const user = results[0];
        if (user.password === password) {
          const token = createJwt(user);
          res.json({ userId: user.id, token, privateKey: user.private_key, publicKey: user.public_key });
        } else {
          res.status(401).json({ error: 'Invalid username or password' });
        }
      }
    });
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

  app.post('/api/register', (req, res) => {
    if (req.body.username.includes(' ') || req.body.password.includes(' ') || req.body.username === '' || req.body.password === '') {
      res.status(500).json({ error: 'Username and password cannot contain spaces' });
      return;
    }
    const { username, password, publicKey, privateKey } = req.body;
    const insertQuery = `
        INSERT INTO Users (username, password, public_key, private_key)
        SELECT ?, ?, ?, ?
        WHERE NOT EXISTS (
            SELECT * FROM Users WHERE username = ?
        )
    `;
    connection.query(insertQuery, [username, password, publicKey, privateKey, username], (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Error registering a user' });
      } else if (result.affectedRows === 0) {
        res.status(400).json({ error: 'User already exists' });
      } else {
        res.json({ id: result.insertId });
      }
    });
  });

  app.get('/api/getPublicKey/:username', (req, res) => {
    const query = 'SELECT public_key FROM Users WHERE username = ?';
    connection.query(query, [req.params.username], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Error retrieving public key' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(results[0].public_key);
      }
    });
  });
};

module.exports = { setupExpress };
