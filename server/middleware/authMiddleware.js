const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.split(' ')[1] : null;
  if (!token) return res.status(401).json({ success: false, message: 'Please log in to continue' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET); // error errorHandler sambhalta hai
  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ success: false, message: 'User not found' });
  req.user = user;
  next();
});

exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ success: false, message: 'You do not have permission to do this' });
