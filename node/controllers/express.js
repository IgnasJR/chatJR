/* eslint-disable no-console */

const { createJwt, verifyJwt } = require('../authentication/authentication');
const { connection } = require('../database/mysql');
const { getConversationsIdsForUsers, createConversation } = require('../database/conversations');

class DomainError extends Error {}

const setupExpress = (app) => {
  app.post('/api/conversations', async ({ body: { otherUserId }, userId }) => {
    const existingConversations = await getConversationsIdsForUsers({ userId, otherUserId });
    if (existingConversations.length > 0) {
      throw new DomainError('Conversation already exists');
    } else {
      await createConversation({ userId, otherUserId });
    }
  });

  // Get all users you can talk to
  app.get('/api/conversations', (req, res) => {
    const userId = verifyJwt(req.headers.authorization);
    const query = `SELECT conversation_id, (CASE WHEN user1_id = ? 
                  THEN (SELECT username FROM Users WHERE id = user2_id) 
                  ELSE (SELECT username FROM Users WHERE id = user1_id) END) AS username
                  FROM Conversations WHERE ? IN (user1_id, user2_id)`;

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
          res.json({ userId: user.id, token });
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
        ORDER BY M.message_id DESC LIMIT 30;`;
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
    const { username, password, publicKey } = req.body;
    const query = 'INSERT INTO Users (username, password, public_key) VALUES (?, ?, ?)';
    connection.query(query, [username, password, publicKey], (err, result) => {
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
