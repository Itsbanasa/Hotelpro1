import mongoose from 'mongoose';
const bookingSchema = new mongoose.Schema({
  room_id: { type: String, required: true }, user_id: { type: String, default: 'Guest' },
  fromdate: { type: Date, required: true }, todate: { type: Date, required: true },
  totaldays: { type: Number, required: true }, totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  name: { type: String, required: true, trim: true }
}, { timestamps: true });
export default mongoose.model('Booking', bookingSchema);
