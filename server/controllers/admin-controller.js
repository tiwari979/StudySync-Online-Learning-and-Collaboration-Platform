const User = require("../models/User");
const Course = require("../models/Course");
const StudentCourses = require("../models/StudentCourses");
const Order = require("../models/Order");
const Group = require("../models/Group");
const GroupMessage = require("../models/GroupMessage");

const generateJoinCode = async () => {
  const createCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  // ensure uniqueness
  while (true) {
    const code = createCode();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Group.findOne({ joinCode: code });
    if (!exists) return code;
  }
};

// Get all users with their details
const getUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const normalizedRole = user.role === "user" ? "student" : user.role;
        let stats = {};

        if (normalizedRole === "instructor") {
          const coursesCount = await Course.countDocuments({ instructorId: user._id });
          stats.coursesCreated = coursesCount;
        } else if (normalizedRole === "student") {
          const studentCourses = await StudentCourses.findOne({ userId: user._id });
          stats.coursesEnrolled = studentCourses ? studentCourses.courses.length : 0;
        }

        return {
          ...user.toObject(),
          role: normalizedRole,
          ...stats,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

// Suspend or ban user
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = "suspended", suspendedUntil = null } = req.body;

    if (!["active", "suspended", "banned"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.status = status;
    user.suspendedUntil = status === "suspended" && suspendedUntil ? new Date(suspendedUntil) : null;
    await user.save();

    return res.status(200).json({ success: true, message: "User status updated", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error updating user status" });
  }
};

// Get all courses with instructor details
const getCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find({}).populate("instructorId", "userName userEmail");
    
    const coursesWithStats = courses.map(course => ({
      ...course.toObject(),
      studentsCount: course.students.length,
      lecturesCount: course.curriculum.length
    }));

    res.status(200).json({
      success: true,
      data: coursesWithStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
    });
  }
};

// Approve course
const approveCourseAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { notes = "" } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    course.approvalStatus = "approved";
    course.approvalNotes = notes;
    await course.save();

    return res.status(200).json({ success: true, message: "Course approved", data: course });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error approving course" });
  }
};

// Reject course
const rejectCourseAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { notes = "" } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    course.approvalStatus = "rejected";
    course.approvalNotes = notes;
    course.isPublished = false;
    await course.save();

    return res.status(200).json({ success: true, message: "Course rejected", data: course });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error rejecting course" });
  }
};

// Assign instructor to course
const assignInstructorAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { instructorId } = req.body;

    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "instructor") {
      return res.status(400).json({ success: false, message: "Instructor not found or invalid role" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    course.instructorId = instructor._id.toString();
    course.instructorName = instructor.userName;
    course.assignedInstructorId = instructor._id;
    await course.save();

    return res.status(200).json({ success: true, message: "Instructor assigned", data: course });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error assigning instructor" });
  }
};

// Edit course (admin override)
const updateCourseAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    const course = await Course.findByIdAndUpdate(courseId, updates, { new: true });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({ success: true, message: "Course updated", data: course });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error updating course" });
  }
};

// Get all enrollments
const getEnrollmentsAdmin = async (req, res) => {
  try {
    const enrollments = await StudentCourses.find({})
      .populate("userId", "userName userEmail")
      .populate("courses.courseId", "title instructorName pricing");

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrollments",
    });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalStudents = await User.countDocuments({ role: { $in: ["student", "user"] } });
    const totalCourses = await Course.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find({ orderStatus: "confirmed" });
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.coursePricing) || 0), 0);
    
    // Get recent activity
    const recentUsersRaw = await User.find({})
      .select("-password")
      .sort({ _id: -1 })
      .limit(5);

    const recentUsers = recentUsersRaw.map((user) => ({
      ...user.toObject(),
      role: user.role === "user" ? "student" : user.role,
    }));
    
    const recentCourses = await Course.find({})
      .populate("instructorId", "userName")
      .sort({ _id: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalInstructors,
          totalStudents,
          totalCourses,
          totalOrders,
          totalRevenue,
        },
        recentUsers,
        recentCourses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching system statistics",
    });
  }
};

// Delete a user
const deleteUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If user is instructor, delete their courses
    if (user.role === "instructor") {
      await Course.deleteMany({ instructorId: userId });
    }

    // If user is student, remove from enrollments
    if (user.role === "student") {
      await StudentCourses.deleteOne({ userId: userId });
      // Remove student from all courses
      await Course.updateMany(
        { "students.studentId": userId },
        { $pull: { students: { studentId: userId } } }
      );
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["student", "instructor", "superadmin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating user role",
    });
  }
};

// Delete a course
const deleteCourseAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Remove course from student enrollments
    await StudentCourses.updateMany(
      { "courses.courseId": courseId },
      { $pull: { courses: { courseId: courseId } } }
    );

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting course",
    });
  }
};

// Toggle course published status
const toggleCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.approvalStatus !== "approved") {
      return res.status(400).json({ success: false, message: "Course must be approved before publishing" });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: "Course status updated successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating course status",
    });
  }
};

// Groups moderation
const getGroupsAdmin = async (req, res) => {
  try {
    const groups = await Group.find({})
      .populate("createdBy", "userName userEmail")
      .sort({ createdAt: -1 });

    const withCounts = groups.map((g) => ({
      ...g.toObject(),
      membersCount: g.members.length,
      mutedCount: g.mutedUsers.length,
    }));

    return res.status(200).json({ success: true, data: withCounts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error fetching groups" });
  }
};

const deleteGroupAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    await Group.findByIdAndDelete(groupId);
    await GroupMessage.deleteMany({ groupId });
    return res.status(200).json({ success: true, message: "Group deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error deleting group" });
  }
};

const deleteGroupMessageAdmin = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await GroupMessage.findByIdAndDelete(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    return res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error deleting message" });
  }
};

const muteUserInGroupAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { mutedUntil = null } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const alreadyIndex = group.mutedUsers.findIndex((m) => m.userId.toString() === userId);
    if (alreadyIndex >= 0) {
      group.mutedUsers[alreadyIndex].mutedUntil = mutedUntil ? new Date(mutedUntil) : null;
    } else {
      group.mutedUsers.push({ userId, mutedUntil: mutedUntil ? new Date(mutedUntil) : null });
    }

    await group.save();
    return res.status(200).json({ success: true, message: "User muted", data: group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error muting user" });
  }
};

const removeUserFromGroupAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { reason = "" } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    group.members = group.members.filter((m) => m.userId.toString() !== userId);
    group.removedUsers.push({ userId, reason });
    await group.save();

    return res.status(200).json({ success: true, message: "User removed from group", data: group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error removing user" });
  }
};

const toggleGroupSettingsAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { chatDisabled, profanityFilterEnabled, spamFilterEnabled } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (typeof chatDisabled === "boolean") group.chatDisabled = chatDisabled;
    if (typeof profanityFilterEnabled === "boolean") group.profanityFilterEnabled = profanityFilterEnabled;
    if (typeof spamFilterEnabled === "boolean") group.spamFilterEnabled = spamFilterEnabled;

    await group.save();
    return res.status(200).json({ success: true, message: "Group settings updated", data: group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error updating group settings" });
  }
};

const createGroupAdmin = async (req, res) => {
  try {
    const { name, description = "" } = req.body;
    const userId = req.user._id;
    if (!name) {
      return res.status(400).json({ success: false, message: "Group name is required" });
    }

    const joinCode = await generateJoinCode();
    const group = await Group.create({
      name,
      description,
      joinCode,
      createdBy: userId,
      members: [{ userId, role: "admin" }],
    });

    return res.status(201).json({ success: true, message: "Group created", data: group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error creating group" });
  }
};

module.exports = {
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
};
