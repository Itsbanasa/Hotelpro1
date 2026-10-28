import mongoose from 'mongoose';
import app from './_lib/app.js';

let connectionPromise;
async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured for this deployment.');
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
      .catch(error => { connectionPromise = null; throw error; });
  }
  await connectionPromise;
}

export default async function handler(req, res) {
  try {
    await connectDatabase();
    // Vercel can pass the catch-all function path without the /api prefix.
    if (!req.url.startsWith('/api/')) req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    return app(req, res);
  } catch (error) {
    console.error('HotelPro API unavailable:', error.message);
    return res.status(503).json({ message: 'The booking service is temporarily unavailable. Check the Vercel MongoDB configuration.' });
  }
}
