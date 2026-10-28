import { Router } from 'express';
import Room from '../models/Room.js';
const router = Router();
router.get('/', async (_req, res, next) => { try { res.json(await Room.find().sort({ roomNumber: 1 })); } catch (e) { next(e); } });
router.post('/addroom', async (req, res, next) => { try {
  const { roomNumber, description, photos, imageUrl, type, rent, count } = req.body;
  const room = await Room.create({ roomNumber, description, photos: photos || (imageUrl ? [imageUrl] : []), type, rent, count });
  res.status(201).json(room);
} catch (e) { next(e); } });
export default router;
