const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
// DB down ho to query 10s tak latak kar timeout hone ki jagah turant error de
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI .env mein set nahi hai');

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    family: 4, // IPv6/DNS delay wali problem avoid karta hai
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);

  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (e) => console.error('MongoDB error:', e.message));
};

module.exports = connectDB;
