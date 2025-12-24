require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Test: MongoDB connected');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test: MongoDB connection failed');
    console.error(err);
    process.exit(1);
  }
}

testConnection();
