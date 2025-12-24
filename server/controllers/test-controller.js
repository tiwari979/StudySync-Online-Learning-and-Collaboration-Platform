const Test = require("../models/Test");
const TestResult = require("../models/TestResult");

// Get all public tests
const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({ isPublic: true })
      .populate("createdBy", "userName")
      .populate("courseId", "title")
      .select("-questions.correctAnswer -questions.explanation")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tests",
    });
  }
};

// Get test by ID (without answers for students)
const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await Test.findById(id)
      .populate("createdBy", "userName")
      .populate("courseId", "title")
      .select("-questions.correctAnswer -questions.explanation");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test",
    });
  }
};

// Submit test and get results
const submitTest = async (req, res) => {
  try {
    const { testId, answers, timeTaken } = req.body;
    const studentId = req.user._id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    let correctAnswers = 0;
    const detailedResults = [];

    answers.forEach((answer, index) => {
      const question = test.questions[index];
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctAnswers++;

      detailedResults.push({
        questionIndex: index,
        question: question.question,
        options: question.options,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      });
    });

    const totalQuestions = test.questions.length;
    const score = correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const testResult = new TestResult({
      testId,
      studentId,
      answers,
      score,
      percentage,
      totalQuestions,
      correctAnswers,
      timeTaken: Number.isFinite(timeTaken) ? timeTaken : 0,
    });

    await testResult.save();

    res.status(200).json({
      success: true,
      data: {
        score,
        percentage,
        totalQuestions,
        correctAnswers,
        detailedResults,
        timeTaken: Number.isFinite(timeTaken) ? timeTaken : 0,
        resultId: testResult._id,
        // include answers and identifiers so history/detail views can reconstruct
        answers,
        testId,
        studentId,
      },
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit test",
    });
  }
};

// Get student's test history
const getStudentTestHistory = async (req, res) => {
  try {
    const studentId = req.user._id;

    const results = await TestResult.find({ studentId })
      .populate("testId", "title category difficulty")
      .sort({ completedAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching test history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test history",
    });
  }
};

// Create test (instructor/admin)
const createTest = async (req, res) => {
  try {
    const { title, description, courseId, category, difficulty, duration, questions } = req.body;
    const createdBy = req.user._id;

    const test = new Test({
      title,
      description,
      courseId,
      category,
      difficulty,
      duration,
      questions,
      createdBy,
    });

    await test.save();

    res.status(201).json({
      success: true,
      data: test,
      message: "Test created successfully",
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test",
    });
  }
};

// Get instructor's tests
const getInstructorTests = async (req, res) => {
  try {
    const createdBy = req.user._id;

    const tests = await Test.find({ createdBy })
      .populate("courseId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    console.error("Error fetching instructor tests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tests",
    });
  }
};

// Get a single test with answers for editing (instructor/admin only)
const getInstructorTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await Test.findById(id).populate("courseId", "title");

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    const userRole = (req.user.role || "").toLowerCase();
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    
    if (test.createdBy.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to view this test" });
    }

    res.status(200).json({ success: true, data: test });
  } catch (error) {
    console.error("Error fetching instructor test:", error);
    res.status(500).json({ success: false, message: "Failed to fetch test" });
  }
};

// Update test (instructor/admin)
const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, courseId, category, difficulty, duration, questions } = req.body;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    const userRole = (req.user.role || "").toLowerCase();
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    
    if (test.createdBy.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to update this test" });
    }

    test.title = title;
    test.description = description;
    test.courseId = courseId || null;
    test.category = category;
    test.difficulty = difficulty;
    test.duration = duration;
    test.questions = questions;

    await test.save();

    res.status(200).json({ success: true, data: test, message: "Test updated successfully" });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({ success: false, message: "Failed to update test" });
  }
};

// Delete test
const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log user info for debugging
    console.log("=== DELETE TEST REQUEST ===");
    console.log("User ID:", req.user._id);
    console.log("User Role:", req.user.role);
    console.log("User object:", JSON.stringify(req.user));
    console.log("Test ID:", id);
    
    // Check if user is admin first - admins can delete anything
    const userRole = (req.user.role || "").toLowerCase();
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    
    console.log("User role (lowercase):", userRole);
    console.log("Is admin?", isAdmin);
    
    if (!isAdmin) {
      // If not admin, check if user is the test creator
      const test = await Test.findById(id);
      
      if (!test) {
        console.log("Test not found!");
        return res.status(404).json({
          success: false,
          message: "Test not found",
        });
      }
      
      const isCreator = test.createdBy.toString() === req.user._id.toString();
      
      console.log("Test creator ID:", test.createdBy.toString());
      console.log("Current user ID:", req.user._id.toString());
      console.log("Is creator?", isCreator);
      
      if (!isCreator) {
        console.log("AUTHORIZATION FAILED - Not admin and not creator");
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this test. Role: " + req.user.role,
        });
      }
    }
    
    // Delete the test and all associated results
    console.log("Deleting test and results...");
    await Test.findByIdAndDelete(id);
    await TestResult.deleteMany({ testId: id });

    console.log("Test deleted successfully!");
    console.log("=========================");

    res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete test",
    });
  }
};

// Get all tests (admin only)
const getAllTestsAdmin = async (req, res) => {
  try {
    const tests = await Test.find()
      .populate("createdBy", "userName email")
      .populate("courseId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    console.error("Error fetching all tests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tests",
    });
  }
};

module.exports = {
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
};
