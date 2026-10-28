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
    const { roomNumber, name = '', description = '', photos, imageUrl, type, rent, count = 1 } = req.body;
    const normalizedNumber = String(roomNumber || '').trim();
    const normalizedType = String(type || '').trim().toLowerCase();
    const numericRent = Number(rent);
    const numericCount = Number(count);
    const photoList = Array.isArray(photos) ? photos : (imageUrl ? [imageUrl] : []);

    if (!normalizedNumber || normalizedNumber.length > 20) {
      return res.status(400).json({ message: 'Enter a room number of 1–20 characters.' });
    }
    if (String(name).trim().length > 80) {
      return res.status(400).json({ message: 'Room names must be 80 characters or fewer.' });
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
      name: String(name).trim(),
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

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, photos, type, rent, count } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim().slice(0, 80);
    if (description !== undefined) updates.description = String(description).trim().slice(0, 500);
    if (photos !== undefined) {
      if (!Array.isArray(photos) || photos.some(photo => typeof photo !== 'string' || photo.length > 2048)) {
        return res.status(400).json({ message: 'Room photos must be valid image URL strings.' });
      }
      updates.photos = photos;
    }
    if (type !== undefined) {
      const normalizedType = String(type).trim().toLowerCase();
      if (!['single', 'double', 'suite'].includes(normalizedType)) return res.status(400).json({ message: 'Choose single, double, or suite as the room style.' });
      updates.type = normalizedType;
    }
    if (rent !== undefined) {
      const numericRent = Number(rent);
      if (!Number.isFinite(numericRent) || numericRent <= 0) return res.status(400).json({ message: 'The nightly rate must be greater than zero.' });
      updates.rent = numericRent;
    }
    if (count !== undefined) {
      const numericCount = Number(count);
      if (!Number.isInteger(numericCount) || numericCount < 1) return res.status(400).json({ message: 'The number of units must be at least one.' });
      updates.count = numericCount;
    }
    const room = await Room.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json(room);
  } catch (error) { next(error); }
});

export default router;
