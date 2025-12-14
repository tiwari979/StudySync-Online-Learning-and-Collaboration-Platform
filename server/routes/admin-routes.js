const express = require("express");
const authenticate = require("../middleware/auth-middleware");
const isAdmin = require("../middleware/admin-middleware");
const {
  getUsersAdmin,
  updateUserStatus,
  getCoursesAdmin,
  approveCourseAdmin,
  rejectCourseAdmin,
  assignInstructorAdmin,
  updateCourseAdmin,
  getEnrollmentsAdmin,
  getSystemStats,
  deleteUserAdmin,
  updateUserRole,
  deleteCourseAdmin,
  toggleCourseStatus,
  getGroupsAdmin,
  deleteGroupAdmin,
  deleteGroupMessageAdmin,
  muteUserInGroupAdmin,
  removeUserFromGroupAdmin,
  toggleGroupSettingsAdmin,
  createGroupAdmin,
} = require("../controllers/admin-controller");

const router = express.Router();

// All routes require authentication and admin privileges
router.get("/users", authenticate, isAdmin, getUsersAdmin);
router.put("/users/:userId/status", authenticate, isAdmin, updateUserStatus);
router.get("/courses", authenticate, isAdmin, getCoursesAdmin);
router.put("/courses/:courseId/approve", authenticate, isAdmin, approveCourseAdmin);
router.put("/courses/:courseId/reject", authenticate, isAdmin, rejectCourseAdmin);
router.put("/courses/:courseId/assign", authenticate, isAdmin, assignInstructorAdmin);
router.put("/courses/:courseId/edit", authenticate, isAdmin, updateCourseAdmin);
router.get("/enrollments", authenticate, isAdmin, getEnrollmentsAdmin);
router.get("/stats", authenticate, isAdmin, getSystemStats);

router.delete("/users/:userId", authenticate, isAdmin, deleteUserAdmin);
router.put("/users/:userId/role", authenticate, isAdmin, updateUserRole);
router.delete("/courses/:courseId", authenticate, isAdmin, deleteCourseAdmin);
router.put("/courses/:courseId/toggle", authenticate, isAdmin, toggleCourseStatus);

// Group moderation
router.get("/groups", authenticate, isAdmin, getGroupsAdmin);
router.post("/groups", authenticate, isAdmin, createGroupAdmin);
router.delete("/groups/:groupId", authenticate, isAdmin, deleteGroupAdmin);
router.delete("/groups/messages/:messageId", authenticate, isAdmin, deleteGroupMessageAdmin);
router.put("/groups/:groupId/mute/:userId", authenticate, isAdmin, muteUserInGroupAdmin);
router.put("/groups/:groupId/remove/:userId", authenticate, isAdmin, removeUserFromGroupAdmin);
router.put("/groups/:groupId/settings", authenticate, isAdmin, toggleGroupSettingsAdmin);

module.exports = router;
