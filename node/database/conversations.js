/* eslint-disable no-console */
/* eslint-disable operator-linebreak */
const { connection } = require('./mysql');

const getConversationsIdsForUsers = async ({ userId, otherUserId }) => {
  const checkQuery = 'SELECT conversation_id FROM Conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)';
  const conversationsIds = await new Promise((resolve, reject) => {
    connection.query(checkQuery, [userId, otherUserId, otherUserId, userId], (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Error executing MySQL query:', checkErr);
        reject(new Error('Failed to get conversations'));
      } else {
        resolve(checkResults);
      }
    });
  });

  return conversationsIds;
};

const createConversation = async ({ userId, username }) => {
  const conversationQuery = `
    INSERT INTO Conversations (user1_id, user2_id)
    SELECT ?, U.id
    FROM Users AS U
    WHERE U.username = ?
    AND NOT EXISTS (
        SELECT 1
        FROM Conversations AS C
        WHERE (C.user1_id = ? AND C.user2_id = U.id)
           OR (C.user1_id = U.id AND C.user2_id = ?)
    );
  `;

  return new Promise((resolve, reject) => {
    connection.query(conversationQuery, [userId, username, userId, userId], (err, result) => {
      if (err) {
        reject(new Error('Error adding conversation'));
      } else if (result && result.affectedRows === 0) {
        resolve('Conversation already exists');
      } else {
        resolve(result.insertId);
      }
    });
  });
};

module.exports = { createConversation, getConversationsIdsForUsers };
