const mongoose = require('mongoose');

let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in environment');
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  console.log('MongoDB connected');
  return cached.conn;
}

module.exports = connectDB;
