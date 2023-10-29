const jwt = require('jsonwebtoken');

const jwtSecretKey = process.env.SecretKey;

export const verifyJwt = async (token) => {
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

export const createJwt = (user) => {
  const token = jwt.sign({ userId: user.id }, jwtSecretKey);

  return token;
};
