const express = require("express");
const {
  getAllTests,
  getTestById,
  submitTest,
  getStudentTestHistory,
  createTest,
  getInstructorTests,
  getInstructorTestById,
  updateTest,
  deleteTest,
  getAllTestsAdmin,
} = require("../controllers/test-controller");
const authenticate = require("../middleware/auth-middleware");

const router = express.Router();

// Student routes
router.get("/all", authenticate, getAllTests);
router.get("/:id", authenticate, getTestById);
router.post("/submit", authenticate, submitTest);
router.get("/history/me", authenticate, getStudentTestHistory);

// Instructor routes
router.post("/create", authenticate, createTest);
router.get("/instructor/my-tests", authenticate, getInstructorTests);
router.get("/instructor/:id", authenticate, getInstructorTestById);
router.put("/instructor/:id", authenticate, updateTest);
router.delete("/:id", authenticate, deleteTest);

// Admin routes
router.get("/admin/all-tests", authenticate, getAllTestsAdmin);

module.exports = router;
