const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tritorc.com';

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(469).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
