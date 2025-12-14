const express = require("express");
const authenticate = require("../middleware/auth-middleware");
const isAdmin = require("../middleware/admin-middleware");
const {
  getUsersAdmin,
  getCoursesAdmin,
  getEnrollmentsAdmin,
  getSystemStats,
  deleteUserAdmin,
  updateUserRole,
  deleteCourseAdmin,
  toggleCourseStatus,
} = require("../controllers/admin-controller");

const router = express.Router();

// All routes require authentication and admin privileges
router.get("/users", authenticate, isAdmin, getUsersAdmin);
router.get("/courses", authenticate, isAdmin, getCoursesAdmin);
router.get("/enrollments", authenticate, isAdmin, getEnrollmentsAdmin);
router.get("/stats", authenticate, isAdmin, getSystemStats);

router.delete("/users/:userId", authenticate, isAdmin, deleteUserAdmin);
router.put("/users/:userId/role", authenticate, isAdmin, updateUserRole);
router.delete("/courses/:courseId", authenticate, isAdmin, deleteCourseAdmin);
router.put("/courses/:courseId/toggle", authenticate, isAdmin, toggleCourseStatus);

module.exports = router;
