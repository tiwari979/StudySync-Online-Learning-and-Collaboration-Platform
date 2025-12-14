import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService, unenrollCourseService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Watch, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);
    }
    console.log(response);
  }

  function openUnenrollDialog(courseId, courseTitle) {
    setSelectedCourse({ id: courseId, title: courseTitle });
    setUnenrollDialogOpen(true);
  }

  async function confirmUnenroll() {
    if (!selectedCourse) return;

    try {
      setIsUnenrolling(true);
      const response = await unenrollCourseService(selectedCourse.id);
      if (response?.success) {
        toast({
          title: "Success",
          description: "You have left the course",
        });
        // Refresh courses list
        await fetchStudentBoughtCourses();
        setUnenrollDialogOpen(false);
        setSelectedCourse(null);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to leave course",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to leave course",
        variant: "destructive",
      });
    } finally {
      setIsUnenrolling(false);
    }
  }

  useEffect(() => {
    fetchStudentBoughtCourses();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          studentBoughtCoursesList.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardContent className="p-4 flex-grow">
                <img
                  src={course?.courseImage}
                  alt={course?.title}
                  className="h-52 w-full object-cover rounded-md mb-4"
                />
                <h3 className="font-bold mb-1">{course?.title}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {course?.instructorName}
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  onClick={() =>
                    navigate(`/course-progress/${course?.courseId}`)
                  }
                  className="flex-1"
                >
                  <Watch className="mr-2 h-4 w-4" />
                  Start Watching
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openUnenrollDialog(course?.courseId, course?.title)}
                  title="Leave this course"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <h1 className="text-3xl font-bold">No Courses found</h1>
        )}
      </div>

      <Dialog open={unenrollDialogOpen} onOpenChange={setUnenrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave "{selectedCourse?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnenrollDialogOpen(false)}
              disabled={isUnenrolling}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmUnenroll}
              disabled={isUnenrolling}
            >
              {isUnenrolling ? "Leaving..." : "Leave Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentCoursesPage;
