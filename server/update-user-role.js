require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Usage: node update-user-role.js <email> <role>
// Example: node update-user-role.js instructor@test.com instructor

async function updateUserRole() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.error('Usage: node update-user-role.js <email> <role>');
    console.error('Example: node update-user-role.js instructor@test.com instructor');
    process.exit(1);
  }

  if (role !== 'student' && role !== 'instructor') {
    console.error('Role must be either "student" or "instructor"');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ userEmail: email });
    
    if (!user) {
      console.error(`User with email "${email}" not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`\nFound user: ${user.userName} (${user.userEmail})`);
    console.log(`Current role: ${user.role || 'NOT SET'}`);
    
    user.role = role;
    await user.save();
    
    console.log(`✓ Successfully updated role to: ${role}\n`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateUserRole();
