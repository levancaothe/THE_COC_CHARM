const AdminUser = require('../models/AdminUser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { username, password, role = 'admin' } = req.body;

    const existing = await AdminUser.findOne({});
    if (existing) return res.status(403).json({ message: 'Admin already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await AdminUser.create({ username, password: hash, role });
    res.json({ id: user._id, username: user.username, role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await AdminUser.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Temporarily allow both plaintext and bcrypt for testing
    const match = (password === user.password) || (await bcrypt.compare(password, user.password).catch(() => false));
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) {
    next(err);
  }
};
