const jwt = require('jsonwebtoken');

const jwtSecretKey = process.env.SecretKey;

const verifyJwt = (req) => {
  const token = req.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    // if (!decoded.userId.match('^[0-9]+$')) return null;
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

const createJwt = (user) => {
  const token = jwt.sign({ userId: user.id }, jwtSecretKey);
  return token;
};

module.exports = { createJwt, verifyJwt };
