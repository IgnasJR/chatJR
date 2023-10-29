require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { authMiddleware } = require('./authentication/middleware');
const { errorHandlingMiddleware } = require('./error-handling/middleware');
const { setupSockets } = require('./controllers/sockets');
const { setupExpress } = require('./controllers/express');

const setup = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(authMiddleware);

  setupExpress(app);

  app.use(errorHandlingMiddleware);

  const httpServer = http.createServer(app);

  const io = socketIo(httpServer, {
    transports: ['websocket', 'polling', 'flashsocket'],
  });

  io.on('connection', setupSockets);
  io.listen(8080);

  const PORT = process.env.UsedPort;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

setup();
