import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { getTestByIdService, submitTestService } from "@/services/test-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function TakeTestPage() {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [id]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      if (timeRemaining === 60) {
        setShowWarning(true);
      }

      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && test) {
      handleSubmit();
    }
  }, [timeRemaining]);

  async function fetchTest() {
    try {
      setLoading(true);
      const response = await getTestByIdService(id);
      if (response.success) {
        setTest(response.data);
        setTimeRemaining(response.data.duration * 60);
      }
    } catch (error) {
      console.error("Error fetching test:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(questionIndex, option) {
    setAnswers({
      ...answers,
      [questionIndex]: option,
    });
  }

  async function handleSubmit() {
    if (submitting) return;

    setSubmitting(true);
    try {
      const formattedAnswers = test.questions.map((_, index) => ({
        questionIndex: index,
        selectedAnswer: answers[index] || null,
      }));

      const response = await submitTestService({
        testId: id,
        answers: formattedAnswers,
        timeTaken: test.duration * 60 - timeRemaining,
      });

      if (response.success) {
        // Store result in localStorage for display
        localStorage.setItem(`testResult_${response.data._id}`, JSON.stringify(response.data));
        navigate(`/student/tests/results/${response.data._id}`);
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive"
      });
      setSubmitting(false);
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  const answeredCount = Object.keys(answers).filter((key) => answers[key] !== undefined).length;
  const progress = ((answeredCount / (test?.questions.length || 1)) * 100).toFixed(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading test...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Test not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <p className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {test.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="font-semibold">{progress}%</div>
          </div>
          <div className={`flex items-center gap-2 ${timeRemaining < 60 ? "text-red-600" : "text-gray-700"}`}>
            <Clock className="w-5 h-5" />
            <span className="text-xl font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {showWarning && timeRemaining < 60 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Less than 1 minute remaining!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Question {currentQuestion + 1}: {test.questions[currentQuestion].question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion] ?? ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion, value)}
          >
            {test.questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded hover:bg-gray-50">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        {currentQuestion < test.questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Test"}
          </Button>
        )}
      </div>

      <div className="mt-6">
        <div className="text-sm text-gray-600 mb-2">Question Navigation</div>
        <div className="grid grid-cols-10 gap-2">
          {test.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`p-2 rounded text-sm font-semibold ${
                currentQuestion === index
                  ? "bg-blue-600 text-white"
                  : answers[index]
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TakeTestPage;
