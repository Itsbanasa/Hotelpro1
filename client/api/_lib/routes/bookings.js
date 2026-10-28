import { Router } from 'express';
import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/getallbookings', async (_req, res, next) => { try { res.json(await Booking.find().sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.get('/mybookings', requireAuth, async (req, res, next) => { try { res.json(await Booking.find({ user_id: req.user.sub }).sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.post('/bookroom', optionalAuth, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { room_id, fromdate, todate, name } = req.body;
    const start = new Date(fromdate), end = new Date(todate);
    if (!room_id || !name?.trim() || !Number.isFinite(+start) || !Number.isFinite(+end) || end <= start) return res.status(400).json({ message: 'Provide a room, guest name, and valid stay dates.' });
    const totaldays = Math.ceil((end - start) / 86400000);
    let booking;
    await session.withTransaction(async () => {
      const room = await Room.findById(room_id).session(session);
      if (!room) throw Object.assign(new Error('Room not found.'), { status: 404 });
      const overlaps = room.currentBookings.some(b => b.status === 'active' && new Date(b.fromdate) < end && new Date(b.todate) > start);
      if (overlaps || room.count < 1) throw Object.assign(new Error('This room is unavailable for those dates.'), { status: 409 });
      [booking] = await Booking.create([{ room_id: String(room._id), user_id: req.user?.sub || 'Guest', fromdate: start, todate: end, totaldays, totalAmount: totaldays * room.rent, name: name.trim() }], { session });
      room.currentBookings.push({ bookingId: booking._id, fromdate: start, todate: end, status: 'active' });
      await room.save({ session });
    });
    res.status(201).json(booking);
  } catch (e) { next(e); } finally { await session.endSession(); }
});
router.post('/cancelbooking', async (req, res, next) => { try {
  const booking = await Booking.findById(req.body.bookingId || req.body._id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  booking.status = 'cancelled'; await booking.save();
  await Room.updateOne({ _id: booking.room_id }, { $set: { 'currentBookings.$[item].status': 'cancelled' } }, { arrayFilters: [{ 'item.bookingId': booking._id }] });
  res.json(booking);
} catch (e) { next(e); } });
export default router;
