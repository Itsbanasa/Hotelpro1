import { Router } from 'express';
import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
const router = Router();

router.get('/getallbookings', async (_req, res, next) => {
  try { res.json(await Booking.find().sort({ createdAt: -1 }).lean()); }
  catch (error) { next(error); }
});

router.get('/mybookings', requireAuth, async (req, res, next) => {
  try { res.json(await Booking.find({ user_id: req.user.sub }).sort({ createdAt: -1 }).lean()); }
  catch (error) { next(error); }
});

router.post('/bookroom', optionalAuth, async (req, res, next) => {
  let session;
  try {
    const { room_id, fromdate, todate, name } = req.body;
    const start = new Date(fromdate), end = new Date(todate);
    if (!mongoose.isValidObjectId(room_id) || !name?.trim() || !Number.isFinite(+start) || !Number.isFinite(+end) || end <= start) {
      return res.status(400).json({ message: 'Provide a valid room, guest name, and stay dates. Check-out must be after check-in.' });
    }
    const totaldays = Math.ceil((end - start) / 86400000);
    let booking;
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const room = await Room.findById(room_id).session(session);
      if (!room) throw Object.assign(new Error('Room not found.'), { status: 404 });
      const overlappingBookings = room.currentBookings.filter(b => b.status === 'active' && new Date(b.fromdate) < end && new Date(b.todate) > start);
      if (overlappingBookings.length >= room.count) throw Object.assign(new Error('This room is unavailable for those dates.'), { status: 409 });
      [booking] = await Booking.create([{ room_id: String(room._id), user_id: req.user?.sub || 'Guest', fromdate: start, todate: end, totaldays, totalAmount: totaldays * room.rent, name: name.trim() }], { session });
      room.currentBookings.push({ bookingId: booking._id, fromdate: start, todate: end, status: 'active' });
      await room.save({ session });
    });
    res.status(201).json(booking);
  } catch (error) { next(error); }
  finally { if (session) await session.endSession(); }
});

router.post('/cancelbooking', async (req, res, next) => {
  try {
    const bookingId = req.body.bookingId || req.body._id;
    if (!mongoose.isValidObjectId(bookingId)) return res.status(400).json({ message: 'A valid booking ID is required.' });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status !== 'cancelled') {
      booking.status = 'cancelled';
      await booking.save();
      await Room.updateOne(
        { _id: booking.room_id },
        { $set: { 'currentBookings.$[item].status': 'cancelled' } },
        { arrayFilters: [{ 'item.bookingId': booking._id }] }
      );
    }
    res.json(booking);
  } catch (error) { next(error); }
});

export default router;
