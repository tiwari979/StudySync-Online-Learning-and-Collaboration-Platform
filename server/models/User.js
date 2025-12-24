const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  password: String,
  role: String,
  status: {
    type: String,
    enum: ["active", "suspended", "banned"],
    default: "active",
  },
  suspendedUntil: { type: Date, default: null },
});

module.exports = mongoose.model("User", UserSchema);
