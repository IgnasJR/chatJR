/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
/* eslint-disable operator-linebreak */
const { connection } = require('./mysql');

const getConversationsIdsForUsers = async ({ userId, otherUserId }) => {
  const checkQuery = 'SELECT conversation_id FROM Conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)';
  const conversationsIds = await new Promise((resolve, reject) => {
    try {
      connection.getConnection();
    } catch (err) {
      connection.release();
      reject(new Error('Failed to establish connection to database'));
    }
    connection.query(checkQuery, [userId, otherUserId, otherUserId, userId], (checkErr, checkResults) => {
      if (checkErr) {
        reject(new Error('Failed to get conversations'));
      } else {
        resolve(checkResults);
      }
    });
  });

  return conversationsIds;
};

const createConversation = async ({ userId, username, firstKey, secondKey }) => {
  if (!username) {
    return new Error('No username provided');
  }

  console.log(username, firstKey, secondKey);

  const conversationQuery = `
    INSERT INTO Conversations (user1_id, user2_id, user1_key, user2_key)
    SELECT ?, U.id, ?, ? FROM Users AS U
    WHERE U.username = ? AND NOT EXISTS (
      SELECT 1 FROM Conversations AS C
      WHERE (
        (C.user1_id = ? AND C.user2_id = U.id)
        OR (C.user1_id = U.id AND C.user2_id = ?)
      )
    ) AND NOT (U.id = ?);
  `;

  return new Promise((resolve, reject) => {
    try {
      connection.getConnection((err, conn) => {
        if (err) {
          reject(new Error('Failed to establish connection to database'));
          return;
        }
        conn.query(conversationQuery, [userId, firstKey, secondKey, username, userId, userId, userId], (error, result) => {
          conn.release();

          if (error) {
            console.log(error);
            reject(new Error('Error adding conversation'));
          } else if (result && result.affectedRows === 0) {
            resolve(new Error('Conversation already exists'));
          } else {
            resolve(result.insertId);
          }
        });
      });
    } catch (err) {
      reject(new Error('Failed to establish connection to database'));
    }
  });
};

const removeConversation = async ({ userId, conversationId }) => {
  const conversationQuery = `
    DELETE FROM Conversations WHERE 
    conversation_id = ? AND 
    (user1_id = ? OR user2_id = ?)
  `;

  const messagesQuery = `
    DELETE FROM Messages WHERE conversation_id = ?
  `;

  return new Promise((resolve, reject) => {
    connection.getConnection((err, conn) => {
      if (err) {
        reject(new Error('Failed to establish connection to database'));
      } else {
        conn.query(conversationQuery, [conversationId, userId, userId], (err, result) => {
          if (err) {
            reject(new Error('Error removing conversation'));
          } else if (result && result.affectedRows === 0) {
            resolve(new Error('Conversation cannot be removed'));
          } else {
            conn.query(messagesQuery, [conversationId], (err, messagesResult) => {
              conn.release();
              if (err) {
                reject(new Error('Error removing messages'));
              } else {
                resolve(messagesResult.affectedRows);
              }
            });
          }
        });
      }
    });
  });
};

module.exports = { createConversation, getConversationsIdsForUsers, removeConversation };
