/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
/* eslint-disable camelcase */
const socketIo = require('socket.io');
const http = require('http');

const { app } = require('./express');
const { verifyJwt } = require('../authentication/authentication');

const httpServer = http.createServer(app);

const io = socketIo(httpServer, {
  transports: ['websocket', 'polling', 'flashsocket'],
});

const setupSockets = (socket) => {
  socket.on('authenticate', ({ token, conversationId }) => {
    const userId = verifyJwt(token);
    if (userId != null) {
      socket.join(conversationId);
    } else {
      socket.disconnect();
    }
  });
  socket.on('message', ({ token, message_id, conversationId, message_content, isPrivate }) => {
    const userId = verifyJwt(token);
    io.to(conversationId).emit('message', {
      message_id,
      conversation_id: conversationId,
      sender_id: userId,
      message_content,
      created_at: null,
      isPrivate,
    });
  });
  socket.on('disconnect', () => {
    socket.leave();
  });
};

module.exports = { setupSockets, io };
