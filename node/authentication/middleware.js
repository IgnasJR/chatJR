const { verifyJwt } = require('./authentication');

const anonymousRoutes = ['/api/login', '/api/register'];

const authMiddleware = async (req, res, next) => {
  if (anonymousRoutes.includes(req.path)) {
    next();
    return;
  }

  const token = req.headers.authorization.split(' ')[1];
  const user = await verifyJwt(token);

  if (!user) {
    res.status(401).json({ error: 'Unauthenticated' });
  }

  req.userId = user.userId;

  next();
};

module.exports = authMiddleware;
