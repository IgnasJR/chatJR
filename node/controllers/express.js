const { createJwt } = require('../authentication/authentication');
const { connection } = require('../database/mysql');
const { getConversationsIdsForUsers, createConversation } = require('../database/conversations');

class DomainError extends Error {}

export const setupExpress = (app) => {
  app.post('/api/conversations', async ({ body: { otherUserId }, userId }, res) => {
    const existingConversations = await getConversationsIdsForUsers({ userId, otherUserId });
    if (existingConversations.length > 0) {
      throw new DomainError('Conversation already exists');
    } else {
      await createConversation({ userId, otherUserId });
    }
  });

  app.post('/api/conversations', (req, res) => {
    const { otherUsername } = req.body;
    const userId = req.userId;

    // Check if the conversation already exists between the users
    const checkQuery = `
    SELECT conversation_id 
    FROM Conversations 
    WHERE (user1_id = ? AND user2_id = (SELECT id FROM Users WHERE username = ?)) 
       OR (user1_id = (SELECT id FROM Users WHERE username = ?) AND user2_id = ?)
  `;

    connection.query(checkQuery, [userId, otherUsername, otherUsername, userId], (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Error executing MySQL query:', checkErr);
        throw DomainError('asdasdasd');
      } else if (checkResults.length > 0) {
        // Conversation already exists
        console.log('Conversation already exists:', checkResults[0].conversation_id);
        res.json({ conversationId: checkResults[0].conversation_id });
      } else {
        // Conversation doesn't exist, create a new one
        const conversationQuery = `
    INSERT INTO Conversations (user1_id, user2_id)
    VALUES (?, (SELECT id FROM Users WHERE username = ?))
  `;

        connection.query(conversationQuery, [userId, otherUsername], (err, result) => {
          if (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).json({ error: 'Error adding conversation' });
          } else {
            console.log('Added conversation between users:', userId, 'and', otherUsername);
            res.json({ conversationId: result.insertId });
          }
        });
      }
    });
  });

  // Get all users you can talk to
  app.get('/api/conversations', (req, res) => {
    const userId = req.userId;
    const query =
      'SELECT conversation_id, ' +
      '(CASE WHEN user1_id = ? THEN (SELECT username FROM Users WHERE id = user2_id) ELSE (SELECT username FROM Users WHERE id = user1_id) END) AS username ' +
      'FROM Conversations WHERE ? IN (user1_id, user2_id)';

    connection.query(query, [userId, userId], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Error retrieving conversations' });
      } else {
        //console.log('Retrieved conversations for user:', userId);
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
      } else {
        if (results.length === 0) {
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
      }
    });
  });

  // Get messages between two users
  app.get('/api/messages/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    const userId = req.userId;

    const query = `SELECT M.* FROM Messages M JOIN Conversations 
                    C ON M.conversation_id = C.conversation_id 
                    WHERE M.conversation_id = ? AND (C.user1_id = ? 
                    OR C.user2_id = ?)`;

    connection.query(query, [conversationId, userId, userId], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Error retrieving messages' });
      } else {
        // console.log('Retrieved messages from the database:', results);
        res.json(results);
      }
    });
  });

  // Add a new message
  app.post('/api/messages', (req, res) => {
    const { conversationId, messageContent } = req.body;
    const query = 'INSERT INTO Messages (sender_id, conversation_id, message_content, created_at) VALUES (?, ?, ?, ?)';
    connection.query(query, [req.userId, conversationId, messageContent, new Date()], (err, result) => {
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
