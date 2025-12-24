import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { getInstructorTestsService, deleteTestService } from "@/services/test-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function InstructorTestsPage() {
  const { auth } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  async function fetchTests() {
    try {
      setLoading(true);
      const response = await getInstructorTestsService();
      if (response.success) {
        setTests(response.data);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!testToDelete) return;

    try {
      const response = await deleteTestService(testToDelete._id);
      if (response.success) {
        setTests(tests.filter((t) => t._id !== testToDelete._id));
        setDeleteDialogOpen(false);
        setTestToDelete(null);
        toast({ title: "Success", description: "Test deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      toast({ title: "Error", description: "Failed to delete test", variant: "destructive" });
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading tests...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Tests</h1>
          <p className="text-gray-600">Manage your practice tests</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/instructor")}>Back to Home</Button>
          <Button onClick={() => navigate("/instructor/tests/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Test
          </Button>
        </div>
      </div>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">You haven't created any tests yet.</p>
            <Button onClick={() => navigate("/instructor/tests/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{test.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-gray-100 px-2 py-1 rounded">{test.category}</span>
                  <span className={`px-2 py-1 rounded font-semibold ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {test.description && (
                  <p className="text-gray-600 mb-4 text-sm">{test.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{test.questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{test.duration} min</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/instructor/tests/edit/${test._id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setTestToDelete(test);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{testToDelete?.title}" and all associated student results.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InstructorTestsPage;
