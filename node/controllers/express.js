/* eslint-disable object-curly-newline */
/* eslint-disable no-console */

const { createJwt, verifyJwt } = require('../authentication/authentication');
const { connection } = require('../database/mysql');
const { createConversation, removeConversation } = require('../database/conversations');

const setupExpress = (app) => {
  app.post('/api/conversations', async (req, res) => {
    const userId = verifyJwt(req.headers.authorization);
    const { username } = req.body;
    const result = await createConversation({ userId, username });
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
      res.status(201).json('Conversation added successfully');
    }
  });

  // Get all users you can talk to
  app.get('/api/conversations', (req, res) => {
    const userId = verifyJwt(req.headers.authorization);
    const query = `
      SELECT 
        C.conversation_id, 
        U.username, 
        U.public_key
      FROM Conversations AS C
      INNER JOIN Users AS U ON (C.user1_id = U.id OR C.user2_id = U.id)
      WHERE ? IN (C.user1_id, C.user2_id)
        AND U.id <> ?
    `;

    connection.query(query, [userId, userId], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Error retrieving conversations' });
      } else {
        console.log('Retrieved conversations for user:', userId);
        res.json(results);
      }
    });
  });

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM Users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Error retrieving user' });
      } else if (results.length === 0) {
        res.status(401).json({ error: 'Invalid username or password' });
      } else {
        const user = results[0];
        if (user.password === password) {
          const token = createJwt(user);
          res.json({ userId: user.id, token, privateKey: user.private_key });
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

    console.log(userId, lastMessageId, conversationId);
    let query;
    switch (lastMessageId) {
      case 0:
        query = `
        SELECT M.* FROM Messages M JOIN Conversations C 
        ON M.conversation_id = C.conversation_id 
        WHERE M.conversation_id = ? AND (C.user1_id = ? 
        OR C.user2_id = ?) AND M.message_id > ? 
        ORDER BY M.message_id ASC LIMIT 30;`;
        break;
      default:
        query = `
        SELECT M.* FROM Messages M JOIN Conversations C 
        ON M.conversation_id = C.conversation_id 
        WHERE M.conversation_id = ? AND (C.user1_id = ? 
        OR C.user2_id = ?) AND M.message_id < ? 
        ORDER BY M.message_id ASC LIMIT 30;`;
    }

    console.log(lastMessageId);
    const fullQuery = connection.format(query, [conversationId, userId, userId, lastMessageId]);

    console.log('Full Query:', fullQuery);

    connection.query(query, [conversationId, userId, userId, lastMessageId], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Error retrieving messages' });
      } else {
        console.log(results);
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
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Error adding message' });
      } else {
        res.json({ id: result.insertId });
      }
    });
  });

  app.post('/api/register', (req, res) => {
    const { username, password, publicKey, privateKey } = req.body;
    const query = 'INSERT INTO Users (username, password, public_key, private_key) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, password, publicKey, privateKey], (err, result) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Error registering a user' });
      } else {
        console.log('Added a new user to the database:', result);
        res.json({ id: result.insertId });
      }
    });
  });
};

module.exports = { setupExpress };
