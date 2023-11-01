/* eslint-env es6 */
/* eslint-disable no-console */
const jwt = require('jsonwebtoken');

const jwtSecretKey = process.env.SecretKey;

// eslint-disable-next-line no-unused-vars
const verifyJwt = async (token) => {
  if (!token) {
    return null;
  }

  const user = await new Promise((resolve) => {
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        resolve(undefined);
      }

      resolve(decoded);
    });
  });

  return {
    userId: user.userId,
  };
};

// eslint-disable-next-line no-unused-vars
const createJwt = (user) => {
  const token = jwt.sign({ userId: user.id }, jwtSecretKey);

  return token;
};

module.exports = { createJwt };
