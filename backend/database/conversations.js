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
    throw new Error('No username provided');
  }

  const conversationQuery = `
    INSERT INTO Conversations (user1_id, user2_id, user1_key, user2_key)
    SELECT ?, U.id, ?, ? FROM Users AS U
    WHERE U.username = ? AND NOT EXISTS (
      SELECT 1 FROM Conversations AS C
      WHERE (
        (C.user1_id = ? AND C.user2_id = U.id)
        OR (C.user1_id = U.id AND C.user2_id = ?)
      )
    ) AND U.id <> ?;
  `;

  try {
    const [result] = await connection.execute(conversationQuery, [userId, firstKey, secondKey, username, userId, userId, userId]);

    if (result.affectedRows === 0) {
      return { message: 'Conversation already exists' };
    }

    return {
      message: 'Conversation added successfully',
      conversationId: result.insertId,
    };
  } catch (error) {
    console.error('SQL Error:', error);
    throw new Error('Error adding conversation');
  }
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

  try {
    const conn = await connection.getConnection();

    try {
      await conn.beginTransaction();

      const [conversationResult] = await conn.execute(conversationQuery, [conversationId, userId, userId]);

      if (conversationResult.affectedRows === 0) {
        await conn.rollback();
        return new Error('Conversation cannot be removed');
      }

      const [messagesResult] = await conn.execute(messagesQuery, [conversationId]);

      await conn.commit();
      return messagesResult.affectedRows;
    } catch (error) {
      await conn.rollback();
      console.error('Error in transaction:', error);
      throw new Error('Error removing conversation and messages');
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new Error('Failed to establish connection to database');
  }
};

module.exports = { createConversation, getConversationsIdsForUsers, removeConversation };

