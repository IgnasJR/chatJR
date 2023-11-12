const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.SecretKey;

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], jwtSecretKey, (err, decoded) => {
    console.log('decoded token: ', decoded);
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Save the user ID from the decoded token in the request object for later use
    req.userId = decoded.userId;
    next();
  });
};

module.exports = verifyToken;
