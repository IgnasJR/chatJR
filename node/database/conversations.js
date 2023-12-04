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

const createConversation = async ({ userId, otherUserId }) => {
  const conversationQuery = 'INSERT INTO Conversations (user1_id, user2_id) VALUES (?, ?)';
  const newId = await new Promise((resolve, reject) => {
    connection.query(conversationQuery, [userId, otherUserId], (err, result) => {
      if (err) {
        reject(new Error('Error adding conversation'));
      } else {
        resolve(result.insertId);
      }
    });
  });

  return newId;
};

module.exports = { createConversation, getConversationsIdsForUsers };
