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
  console.log(`User connected: ${socket.id}`);
  socket.on('authenticate', ({ token, conversationId }) => {
    const userId = verifyJwt(token);
    console.log('User', userId, 'has joined', conversationId);
    socket.join(conversationId);
  });
  socket.on('message', ({ token, message_id, conversationId, message_content, isPrivate }) => {
    const userId = verifyJwt(token);
    console.log('User', userId, 'sent a message: ', message_content);
    io.to(conversationId).emit('message', {
      message_id,
      conversation_id: conversationId,
      sender_id: userId,
      message_content,
      created_at: null,
      isPrivate,
    });
    console.log('Message:', message_content, 'emitted', 'to', conversationId, isPrivate ? 'privately' : 'publicly');
  });
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    socket.leave();
  });
};

module.exports = { setupSockets, io };
