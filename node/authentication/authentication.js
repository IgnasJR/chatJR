const jwt = require('jsonwebtoken');

const jwtSecretKey = process.env.SecretKey;

const verifyJwt = (req) => {
  const token = req.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    if (decoded.iat > Date.now() / 1000 + 60 * 60 * 24) {
      return null;
    }
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

const createJwt = (user) => {
  const token = jwt.sign({ userId: user.id }, jwtSecretKey);
  return token;
};

module.exports = { createJwt, verifyJwt };
