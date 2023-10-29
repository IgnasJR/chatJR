export const setupSockets = (socket) => {
    console.log(`User connected: ${socket.id}`);
  socket.on('authenticate', ({ token, conversationId }) => {
    let tokenData = jwt.decode(token)
    //DO NOT FORGET TO VERIFY THAT A USER IS IN THE CONVERSATION 
    console.log('User', tokenData.userId, 'has joined', conversationId )
    socket.join(conversationId)
  });
  socket.on('message', ({token, message_id, conversationId, message_Content  }) =>{
    let tokenData = jwt.decode(token);
    console.log('User', tokenData.userId, 'sent a message: ', message_Content );
    io.to(conversationId).emit('message', ({ message_id: message_id, conversation_id: conversationId, sender_id: tokenData.userId, message_content: message_Content, created_at: null  }));
    console.log('Message:', message_Content, 'emitted')
  });
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    socket.leave()
  })
};
