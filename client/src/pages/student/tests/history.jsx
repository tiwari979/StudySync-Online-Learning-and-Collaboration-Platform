import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import { getStudentTestHistoryService } from "@/services/test-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Clock, Award, Calendar } from "lucide-react";

function TestHistoryPage() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      const response = await getStudentTestHistoryService();
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching test history:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 75) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-blue-600 bg-blue-100";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Test History</h1>
          <p className="text-gray-600">View your past test attempts and performance</p>
        </div>
        <Button onClick={() => navigate("/student/tests")} variant="outline">
          Back to Tests
        </Button>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">You haven't taken any tests yet.</p>
            <Button onClick={() => navigate("/student/tests")}>
              Browse Tests
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((result) => (
            <Card key={result._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{result.testId?.title || "Untitled Test"}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(result.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart className="w-4 h-4" />
                        <span>{result.testId?.category || "General"}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getPerformanceColor(result.percentage)}`}>
                    {result.percentage.toFixed(1)}%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <Award className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-lg font-bold">{result.score}</div>
                      <div className="text-xs text-gray-600">Score</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <BarChart className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="text-lg font-bold">
                        {result.correctAnswers}/{result.totalQuestions}
                      </div>
                      <div className="text-xs text-gray-600">Correct</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <Clock className="w-8 h-8 text-purple-600" />
                    <div>
                      <div className="text-lg font-bold">{formatTime(result.timeTaken)}</div>
                      <div className="text-xs text-gray-600">Time Taken</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const toStore = {
                        ...result,
                        detailedResults: result.detailedResults || [],
                        answers: result.answers || [],
                        timeTaken: result.timeTaken ?? 0,
                        score: result.score ?? 0,
                        percentage: result.percentage ?? 0,
                        correctAnswers: result.correctAnswers ?? 0,
                        totalQuestions: result.totalQuestions ?? (result.testId?.questions?.length || 0),
                        testId: result.testId?._id || result.testId,
                      };
                      localStorage.setItem(`testResult_${result._id}`, JSON.stringify(toStore));
                      navigate(`/student/tests/results/${result._id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestHistoryPage;
