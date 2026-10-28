import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true, trim: true },
  name: { type: String, default: '' },
  description: { type: String, default: '' }, photos: [{ type: String }],
  type: { type: String, enum: ['single', 'double', 'suite'], required: true },
  rent: { type: Number, required: true, min: 0 }, count: { type: Number, default: 1, min: 0 },
  currentBookings: [{ bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, fromdate: Date, todate: Date, status: { type: String, default: 'active' } }]
}, { timestamps: true });
export default mongoose.model('Room', roomSchema);
