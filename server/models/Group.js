const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    joinCode: { type: String, unique: true, index: true },
    inviteToken: { type: String, default: "" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["admin", "member"], default: "member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    mutedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        mutedUntil: { type: Date, default: null },
      },
    ],
    removedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, default: "" },
      },
    ],
    chatDisabled: { type: Boolean, default: false },
    profanityFilterEnabled: { type: Boolean, default: false },
    spamFilterEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);

