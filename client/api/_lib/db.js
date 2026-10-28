import mongoose from 'mongoose';
import Room from './models/Room.js';

const sampleRooms = [
  {
    roomNumber: '101',
    type: 'single',
    description: 'A calm, light-filled room with a queen bed, work desk, rainfall shower, and quiet courtyard views.',
    photos: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85'],
    rent: 89,
    count: 1,
    currentBookings: []
  },
  {
    roomNumber: '202',
    type: 'double',
    description: 'A spacious double room with two plush beds, warm natural finishes, and a generous marble bathroom.',
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85'],
    rent: 149,
    count: 1,
    currentBookings: []
  },
  {
    roomNumber: '305',
    type: 'suite',
    description: 'Our signature suite pairs a separate lounge, king bed, deep soaking tub, and panoramic city views.',
    photos: ['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85'],
    rent: 279,
    count: 1,
    currentBookings: []
  }
];

let connectionPromise;
let seedingPromise;
let seedCheckComplete = false;

async function seedSampleRoomsWhenRequested() {
  if (process.env.SEED_SAMPLE_ROOMS === 'false') return;
  if (seedCheckComplete) return;
  if (!seedingPromise) {
    seedingPromise = (async () => {
      await Room.init();
      if (await Room.exists({})) {
        seedCheckComplete = true;
        return;
      }
      try {
        await Room.insertMany(sampleRooms, { ordered: false });
        seedCheckComplete = true;
        console.info('HotelPro sample rooms added to the empty database.');
      } catch (error) {
        // Parallel first requests can race after checking the empty collection.
        // The unique roomNumber index makes the second insert harmless.
        if (error.code !== 11000 && !error.writeErrors?.every(item => item.code === 11000)) throw error;
        seedCheckComplete = true;
      }
    })().finally(() => { seedingPromise = null; });
  }
  await seedingPromise;
}

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    await seedSampleRoomsWhenRequested();
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured.');

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 5,
      minPoolSize: 0
    }).then(async () => {
      await seedSampleRoomsWhenRequested();
      return mongoose.connection;
    }).catch(error => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
  return mongoose.connection;
}

export function databaseStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
