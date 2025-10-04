import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // Always clear the cache to ensure new settings take effect
  cached.conn = null;
  cached.promise = null;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'searches' // Explicitly set database name
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    const conn = await cached.promise;
    cached.conn = conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function connectToDatabase() {
  const conn = await connectDB();
  if (!conn.connection.db) {
    throw new Error('Failed to connect to database');
  }
  // Ensure we're using the correct database
  const db = conn.connection.useDb('searches');
  return {
    db: db,
    connection: conn.connection
  };
}

export default connectDB;