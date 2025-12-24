// Script to create a super admin user
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin details - CHANGE THESE!
    const adminEmail = "admin@example.com";
    const adminPassword = "Admin@123";
    const adminName = "Super Admin";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ userEmail: adminEmail });
    if (existingAdmin) {
      console.log("⚠️  User with this email already exists!");
      console.log("Updating role to superadmin...");
      existingAdmin.role = "superadmin";
      await existingAdmin.save();
      console.log("✅ Role updated to superadmin!");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create super admin user
    const superAdmin = new User({
      userName: adminName,
      userEmail: adminEmail,
      password: hashedPassword,
      role: "superadmin",
    });

    await superAdmin.save();
    console.log("✅ Super admin created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("\n⚠️  IMPORTANT: Change these credentials after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();
