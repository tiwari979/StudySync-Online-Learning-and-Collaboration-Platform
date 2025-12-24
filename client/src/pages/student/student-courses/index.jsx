import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { fetchStudentBoughtCoursesService, unenrollCourseService, getCurrentCourseProgressService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Watch, X, PlayCircle, CheckCircle } from "lucide-react";
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
  const [courseProgress, setCourseProgress] = useState({});

  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);
      // Fetch progress for each course
      await fetchAllCourseProgress(response?.data);
    }
    console.log(response);
  }

  async function fetchAllCourseProgress(courses) {
    if (!courses || !auth?.user?._id) return;
    
    const progressData = {};
    for (const course of courses) {
      try {
        const progress = await getCurrentCourseProgressService(
          auth.user._id,
          course.courseId
        );
        if (progress?.success && progress?.data) {
          progressData[course.courseId] = progress.data;
        }
      } catch (error) {
        console.log(`Failed to fetch progress for course ${course.courseId}`, error);
      }
    }
    console.log('Course Progress Data:', progressData);
    setCourseProgress(progressData);
  }

  function getCourseStats(courseId) {
    const progress = courseProgress[courseId];
    
    if (!progress) {
      console.log(`No progress data for course ${courseId}`);
      return { completed: 0, total: 0, percentage: 0, lastLecture: null };
    }

    console.log(`Progress for course ${courseId}:`, progress);

    // Get total lectures from courseDetails if available
    const totalLectures = progress.courseDetails?.curriculum?.length || 0;
    const lecturesProgress = progress.lecturesProgress || progress.progress || [];
    const completedLectures = lecturesProgress.filter(lec => lec.viewed).length || 0;
    const percentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
    
    console.log(`Stats for ${courseId}: ${completedLectures}/${totalLectures} = ${percentage}%`);
    
    // Find last viewed lecture
    const lastViewed = lecturesProgress
      .filter(lec => lec.viewed && lec.dateViewed)
      .sort((a, b) => new Date(b.dateViewed) - new Date(a.dateViewed))[0];

    return { 
      completed: completedLectures, 
      total: totalLectures, 
      percentage, 
      lastLecture: lastViewed?.lectureId 
    };
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

  // Refresh progress when page becomes visible (user returns from watching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && studentBoughtCoursesList?.length > 0) {
        fetchAllCourseProgress(studentBoughtCoursesList);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [studentBoughtCoursesList]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          studentBoughtCoursesList.map((course) => {
            const stats = getCourseStats(course?.courseId);
            return (
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
                
                {/* Progress Section */}
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      {stats.completed} / {stats.total} lessons
                    </span>
                    <span className="font-semibold text-indigo-600">
                      {stats.percentage}%
                    </span>
                  </div>
                  <Progress value={stats.percentage} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="gap-2 flex-col">
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => {
                      if (stats.lastLecture) {
                        navigate(`/course-progress/${course?.courseId}?lecture=${stats.lastLecture}`);
                      } else {
                        navigate(`/course-progress/${course?.courseId}`);
                      }
                    }}
                    className="flex-1"
                    variant={stats.lastLecture ? "default" : "outline"}
                  >
                    {stats.lastLecture ? (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Watch className="mr-2 h-4 w-4" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openUnenrollDialog(course?.courseId, course?.title)}
                    title="Leave this course"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            );
          })
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
