const StudentCourses = require("../../models/StudentCourses");
const Course = require("../../models/Course");

const getCoursesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const studentBoughtCourses = await StudentCourses.findOne({
      userId: studentId,
    });

    res.status(200).json({
      success: true,
      data: studentBoughtCourses.courses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Remove course from StudentCourses
    await StudentCourses.updateOne(
      { userId },
      { $pull: { courses: { courseId } } }
    );

    // Remove student from Course.students array
    await Course.updateOne(
      { _id: courseId },
      { $pull: { students: { studentId: userId } } }
    );

    return res.status(200).json({
      success: true,
      message: "Successfully unenrolled from course",
    });
  } catch (error) {
    console.error("unenrollCourse error:", error);
    return res.status(500).json({
      success: false,
      message: "Error unenrolling from course",
    });
  }
};

module.exports = { getCoursesByStudentId, unenrollCourse };
