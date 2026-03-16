const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = (req.body.password || '').trim();
  console.log('[AUTH] login attempt:', username);
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('[AUTH] user not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = await user.comparePassword(password);
    console.log('[AUTH] password valid?', valid);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role, username: user.username });
  } catch (error) {
    console.error('[AUTH] error logging in', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register (for admin setup, can be removed later)
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  // Dev helper: list users (no password) to verify seeding and credentials
  router.get('/debug/users', async (req, res) => {
    const users = await User.find().select('username role -_id');
    res.json(users);
  });
}

module.exports = router;