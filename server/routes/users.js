import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createSession, requireAuth } from '../middleware/auth.js';

const router = Router();
const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email, phone: user.phone, type: user.type });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone = '' } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Choose a password with at least 8 characters.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, phone: String(phone).trim(), password: await bcrypt.hash(password, 12), type: 'customer' });
    res.status(201).json({ user: publicUser(user), token: createSession(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.trim().toLowerCase() });
    if (!user || !await bcrypt.compare(req.body.password || '', user.password)) return res.status(401).json({ message: 'That email and password don’t match. Please try again.' });
    res.json({ user: publicUser(user), token: createSession(user) });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try { const user = await User.findById(req.user.sub).select('-password'); if (!user) return res.status(401).json({ message: 'Account not found. Please sign in again.' }); res.json(publicUser(user)); }
  catch (error) { next(error); }
});

router.get('/getallusers', async (_req, res, next) => {
  try { res.json(await User.find().select('-password').sort({ createdAt: -1 })); }
  catch (error) { next(error); }
});

export default router;
