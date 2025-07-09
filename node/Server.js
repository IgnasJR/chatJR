/* eslint-disable no-console */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupSockets } = require('./controllers/sockets');
const { setupExpress } = require('./controllers/express');
const { io } = require('./controllers/sockets');

const setup = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  setupExpress(app);
  io.on('connection', setupSockets);
  io.listen(3001);

  const PORT = process.env.UsedPort;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

setup();

