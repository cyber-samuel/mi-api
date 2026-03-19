const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../modules/auth/service');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, data: null, message: 'Token requerido' });
  }

  if (isBlacklisted(token)) {
    return res.status(401).json({ success: false, data: null, message: 'Token invalidado. Inicia sesión nuevamente' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user  = payload;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, data: null, message: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;
