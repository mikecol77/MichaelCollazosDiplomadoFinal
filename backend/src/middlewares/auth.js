const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Falta Authorization header' });

  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ message: 'Formato de token inválido' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido/expirado' });
  }
};