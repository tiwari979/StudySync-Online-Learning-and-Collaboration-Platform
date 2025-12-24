import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Award, BarChart } from "lucide-react";

function TestResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch the result from the server.
    // For now, get it from localStorage (set on submit or from history view).
    const storedResult = localStorage.getItem(`testResult_${id}`);
    if (storedResult) {
      const parsed = JSON.parse(storedResult);
      // Ensure required arrays exist to avoid render errors when viewing from history
      parsed.detailedResults = parsed.detailedResults || [];
      parsed.answers = parsed.answers || [];
      setResult(parsed);
      setLoading(false);
    } else {
      // If no stored result, redirect back
      navigate("/student/tests");
    }
  }, [id]);

  function formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return "0m 0s";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading results...</div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return "Excellent! Outstanding performance!";
    if (percentage >= 75) return "Great job! You did very well!";
    if (percentage >= 60) return "Good work! Keep it up!";
    if (percentage >= 40) return "Not bad, but there's room for improvement.";
    return "Keep practicing! You'll improve with time.";
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getPerformanceColor(result.percentage)}`}>
                {result.percentage.toFixed(1)}%
              </div>
              <p className="text-xl text-gray-600">{getPerformanceMessage(result.percentage)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{result.score}</div>
              <div className="text-sm text-gray-600">Total Score</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <BarChart className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{formatTime(result.timeTaken)}</div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Detailed Breakdown</h2>
        <div className="space-y-4">
          {result.detailedResults.map((item, index) => (
            <Card key={index} className={item.isCorrect ? "border-green-200" : "border-red-200"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex-1">
                    Question {index + 1}: {item.question}
                  </CardTitle>
                  {item.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Your Answer: </span>
                    <span className={item.isCorrect ? "text-green-600" : "text-red-600"}>
                      {item.selectedAnswer || "Not answered"}
                    </span>
                  </div>
                  {!item.isCorrect && (
                    <div>
                      <span className="font-semibold">Correct Answer: </span>
                      <span className="text-green-600">{item.correctAnswer}</span>
                    </div>
                  )}
                  {item.explanation && (
                    <div className="mt-2 p-3 bg-blue-50 rounded">
                      <span className="font-semibold">Explanation: </span>
                      <span className="text-gray-700">{item.explanation}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={() => navigate("/student/tests")} variant="outline">
          Back to Tests
        </Button>
        <Button onClick={() => navigate("/student/tests/history")}>
          View History
        </Button>
      </div>
    </div>
  );
}

export default TestResultsPage;
