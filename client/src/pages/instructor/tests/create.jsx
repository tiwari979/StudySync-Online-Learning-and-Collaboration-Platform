import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { useToast } from "@/hooks/use-toast";
import { createTestService, updateTestService, getInstructorTestByIdService } from "@/services/test-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

function CreateTestPage() {
  const { auth } = useContext(AuthContext);
  const { instructorCoursesList } = useContext(InstructorContext);
  const navigate = useNavigate();
  const { testId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const isEditMode = Boolean(testId);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    category: "",
    difficulty: "Medium",
    duration: 30,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
      },
    ],
  });

  useEffect(() => {
    if (!isEditMode) {
      setInitialLoad(false);
      return;
    }

    async function loadTest() {
      try {
        const response = await getInstructorTestByIdService(testId);
        if (response.success) {
          const data = response.data;
          setFormData({
            title: data.title || "",
            description: data.description || "",
            courseId: data.courseId?._id || "",
            category: data.category || "",
            difficulty: data.difficulty || "Medium",
            duration: data.duration || 30,
            questions: data.questions?.length
              ? data.questions.map((q) => ({
                  question: q.question || "",
                  options: q.options && q.options.length ? q.options : ["", "", "", ""],
                  correctAnswer: q.correctAnswer || "",
                  explanation: q.explanation || "",
                }))
              : [
                  {
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: "",
                    explanation: "",
                  },
                ],
          });
        }
      } catch (error) {
        console.error("Error loading test:", error);
        toast({
          title: "Error",
          description: "Failed to load test for editing",
          variant: "destructive"
        });
        navigate("/instructor/tests");
      } finally {
        setInitialLoad(false);
      }
    }

    loadTest();
  }, [isEditMode, testId]);

  function handleInputChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleQuestionChange(index, field, value) {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  }

  function handleOptionChange(questionIndex, optionIndex, value) {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  }

  function addQuestion() {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          explanation: "",
        },
      ],
    });
  }

  function removeQuestion(index) {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a test title",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category",
        variant: "destructive"
      });
      return;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        toast({
          title: "Validation Error",
          description: `Question ${i + 1} is empty`,
          variant: "destructive"
        });
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        toast({
          title: "Validation Error",
          description: `Question ${i + 1} has empty options`,
          variant: "destructive"
        });
        return;
      }
      if (!q.correctAnswer.trim()) {
        toast({
          title: "Validation Error",
          description: `Question ${i + 1} has no correct answer selected`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        courseId: formData.courseId ? formData.courseId : null,
      };

      const response = isEditMode
        ? await updateTestService(testId, payload)
        : await createTestService(payload);

      if (response.success) {
        toast({
          title: "Success",
          description: isEditMode ? "Test updated successfully!" : "Test created successfully!"
        });
        navigate("/instructor/tests");
      }
    } catch (error) {
      console.error("Error saving test:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} test. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading test...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{isEditMode ? "Edit Test" : "Create New Test"}</h1>
        <p className="text-gray-600">{isEditMode ? "Update your test details" : "Create a practice test for your students"}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Test Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., JavaScript Basics Quiz"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the test"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseId">Course (Optional)</Label>
                <Select
                  value={formData.courseId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Course</SelectItem>
                    {instructorCoursesList.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Programming, Mathematics"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {formData.questions.map((question, qIndex) => (
          <Card key={qIndex} className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question {qIndex + 1}</CardTitle>
                {formData.questions.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`question-${qIndex}`}>Question *</Label>
                <Textarea
                  id={`question-${qIndex}`}
                  value={question.question}
                  onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                  placeholder="Enter your question"
                  required
                  rows={2}
                />
              </div>

              <div>
                <Label>Options *</Label>
                {question.options.map((option, oIndex) => (
                  <Input
                    key={oIndex}
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    className="mb-2"
                    required
                  />
                ))}
              </div>

              <div>
                <Label htmlFor={`correct-${qIndex}`}>Correct Answer *</Label>
                <Select
                  value={question.correctAnswer}
                  onValueChange={(value) => handleQuestionChange(qIndex, "correctAnswer", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options.filter((opt) => opt.trim()).length > 0 ? (
                      question.options
                        .filter((opt) => opt.trim())
                        .map((option, oIndex) => (
                          <SelectItem key={oIndex} value={option}>
                            {option}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="placeholder" disabled>
                        Please fill in options first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`explanation-${qIndex}`}>Explanation (Optional)</Label>
                <Textarea
                  id={`explanation-${qIndex}`}
                  value={question.explanation}
                  onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
                  placeholder="Explain why this is the correct answer"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-4 mb-6">
          <Button type="button" variant="outline" onClick={addQuestion} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/instructor/tests")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update Test" : "Create Test"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateTestPage;
