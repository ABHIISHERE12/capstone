const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users  (admin only)
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { next(err); }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json(user);
  } catch (err) { next(err); }
});

// PUT /api/users/:id  (update own profile)
router.put('/:id', protect, async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    const { name, avatar } = req.body;
    user.name = name ?? user.name;
    user.avatar = avatar ?? user.avatar;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, avatar: updated.avatar });
  } catch (err) { next(err); }
});

module.exports = router;
