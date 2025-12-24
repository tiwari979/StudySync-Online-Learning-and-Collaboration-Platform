require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, 'userName userEmail role').lean();
    
    console.log('\n=== ALL USERS IN DATABASE ===\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.userName}`);
      console.log(`   Email: ${user.userEmail}`);
      console.log(`   Role: ${user.role || 'NOT SET (defaults to student)'}`);
      console.log(`   ID: ${user._id}`);
      console.log('---');
    });

    console.log(`\nTotal users: ${users.length}\n`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
