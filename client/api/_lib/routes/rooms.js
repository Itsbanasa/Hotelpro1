import { Router } from 'express';
import Room from '../models/Room.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 }).lean();
    res.json(rooms);
  } catch (error) { next(error); }
});

router.post('/addroom', async (req, res, next) => {
  try {
    const { roomNumber, description = '', photos, imageUrl, type, rent, count = 1 } = req.body;
    const normalizedNumber = String(roomNumber || '').trim();
    const normalizedType = String(type || '').trim().toLowerCase();
    const numericRent = Number(rent);
    const numericCount = Number(count);
    const photoList = Array.isArray(photos) ? photos : (imageUrl ? [imageUrl] : []);

    if (!normalizedNumber || normalizedNumber.length > 20) {
      return res.status(400).json({ message: 'Enter a room number of 1–20 characters.' });
    }
    if (!['single', 'double', 'suite'].includes(normalizedType)) {
      return res.status(400).json({ message: 'Choose single, double, or suite as the room style.' });
    }
    if (!Number.isFinite(numericRent) || numericRent <= 0) {
      return res.status(400).json({ message: 'The nightly rate must be greater than zero.' });
    }
    if (!Number.isInteger(numericCount) || numericCount < 1) {
      return res.status(400).json({ message: 'The number of units must be at least one.' });
    }
    if (!Array.isArray(photoList) || photoList.some(photo => typeof photo !== 'string' || photo.length > 2048)) {
      return res.status(400).json({ message: 'Room photos must be valid image URL strings.' });
    }

    const room = await Room.create({
      roomNumber: normalizedNumber,
      description: String(description).trim().slice(0, 500),
      photos: photoList,
      type: normalizedType,
      rent: numericRent,
      count: numericCount
    });
    res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That room number is already in use.' });
    next(error);
  }
});

export default router;
