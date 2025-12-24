const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const {
  getCoursesByStudentId,
  unenrollCourse,
} = require("../../controllers/student-controller/student-courses-controller");

const router = express.Router();

router.get("/get/:studentId", getCoursesByStudentId);
router.post("/unenroll/:courseId", authenticate, unenrollCourse);

module.exports = router;
