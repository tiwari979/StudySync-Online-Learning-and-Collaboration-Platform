const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  public_id: String,
  freePreview: Boolean,
});

const CourseSchema = new mongoose.Schema({
  instructorId: String,
  instructorName: String,
  assignedInstructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date,
  title: String,
  category: String,
  level: String,
  primaryLanguage: String,
  subtitle: String,
  description: String,
  image: String,
  welcomeMessage: String,
  pricing: Number,
  objectives: String,
  students: [
    {
      studentId: String,
      studentName: String,
      studentEmail: String,
      paidAmount: String,
    },
  ],
  curriculum: [LectureSchema],
    isPublised: Boolean,
    isPublished: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalNotes: { type: String, default: "" },
});

module.exports = mongoose.model("Course", CourseSchema);
