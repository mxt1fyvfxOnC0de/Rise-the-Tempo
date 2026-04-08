import mongoose from 'mongoose';

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not configured. API will run without DB connection.');
    return;
  }

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'rise-tempo' });
  console.log('Mongo connected');
}
