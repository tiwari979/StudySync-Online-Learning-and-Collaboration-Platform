const User = require("../models/User");
const Course = require("../models/Course");
const StudentCourses = require("../models/StudentCourses");
const Order = require("../models/Order");

// Get all users with their details
const getUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        let stats = {};
        
        if (user.role === "instructor") {
          const coursesCount = await Course.countDocuments({ instructorId: user._id });
          stats.coursesCreated = coursesCount;
        } else if (user.role === "student") {
          const studentCourses = await StudentCourses.findOne({ userId: user._id });
          stats.coursesEnrolled = studentCourses ? studentCourses.courses.length : 0;
        }
        
        return {
          ...user.toObject(),
          ...stats
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
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCourses = await Course.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find({ orderStatus: "confirmed" });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.orderPrice || 0), 0);
    
    // Get recent activity
    const recentUsers = await User.find({})
      .select("-password")
      .sort({ _id: -1 })
      .limit(5);
    
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

module.exports = {
  getUsersAdmin,
  getCoursesAdmin,
  getEnrollmentsAdmin,
  getSystemStats,
  deleteUserAdmin,
  updateUserRole,
  deleteCourseAdmin,
  toggleCourseStatus,
};
