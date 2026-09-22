const jwt = require('jsonwebtoken');
const User = require('../models/user');
exports.protect = async (req, res, next) => {
  try {
    const token = req.get('authorization')?.replace(/^Bearer /, '') || req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || decoded.version !== user.tokenVersion) return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    if (user.suspended) return res.status(403).json({ message: 'Your account is suspended. Contact the platform team.' });
    req.user = user;
    next();
  } catch (error) {
    if (error.name?.startsWith('Sequelize')) return next(error);
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
};
exports.allow = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'This account cannot perform that action.' });