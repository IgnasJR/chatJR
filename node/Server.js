/* eslint-disable no-unused-vars */
/* eslint-env es6 */
/* eslint-disable no-console */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authMiddleware } = require('./authentication/middleware');
const { errorHandlingMiddleware } = require('./error-handling/middleware');
const { setupSockets } = require('./controllers/sockets');
const { setupExpress } = require('./controllers/express');
const { io } = require('./controllers/sockets');

const setup = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  // eslint-disable-next-line spaced-comment
  //app.use(authMiddleware);

  setupExpress(app);
  // eslint-disable-next-line spaced-comment
  //app.use(errorHandlingMiddleware);
  io.on('connection', setupSockets);
  io.listen(8080);

  const PORT = process.env.UsedPort;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

setup();
