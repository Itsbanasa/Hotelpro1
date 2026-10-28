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
  if (!req.url.startsWith('/api/')) req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  if (req.url.split('?')[0] === '/api/health') {
    return res.status(200).json({ status: 'ok', databaseConfigured: Boolean(process.env.MONGO_URI) });
  }
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error('HotelPro API unavailable:', error.message);
    const message = error.message.includes('MONGO_URI is not configured')
      ? 'MONGO_URI is missing from the Vercel project environment variables.'
      : 'Could not connect to MongoDB. Check the connection string, database user, and Atlas network access.';
    return res.status(503).json({ message });
  }
}
