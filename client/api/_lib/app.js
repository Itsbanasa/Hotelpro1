import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDatabase } from './db.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed to access the HotelPro API.'));
  }
}));
app.use(express.json({ limit: '32kb' }));
app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    error.status = 503;
    next(error);
  }
});
app.get('/api/health', (_req, res) => res.json({
  status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use((_req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((err, _req, res, _next) => {
  console.error('HotelPro API error:', err.message);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  const message = status === 503
    ? (err.message.includes('MONGO_URI is not configured') ? 'MONGO_URI is not configured.' : 'MongoDB is unavailable. Check the URI, database user, and Atlas network access.')
    : status < 500 ? err.message : 'The request could not be completed. Please try again.';
  res.status(status).json({ message });
});
export default app;
