import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
const router = Router();
router.post('/register', async (req, res, next) => { try { const { name, email, password, phone } = req.body; if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' }); const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), phone }); res.status(201).json({ id: user._id, name: user.name, email: user.email, type: user.type }); } catch (e) { next(e); } });
router.post('/login', async (req, res, next) => { try { const user = await User.findOne({ email: req.body.email?.toLowerCase() }); if (!user || !await bcrypt.compare(req.body.password || '', user.password)) return res.status(401).json({ message: 'Invalid email or password.' }); res.json({ id: user._id, name: user.name, email: user.email, type: user.type }); } catch (e) { next(e); } });
router.get('/getallusers', async (_req, res, next) => { try { res.json(await User.find().select('-password').sort({ createdAt: -1 })); } catch (e) { next(e); } });
export default router;
