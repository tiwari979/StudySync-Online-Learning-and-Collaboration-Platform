import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  createCourseGroupService,
  getCourseGroupByCourseService,
  joinCourseGroupService,
} from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Copy, Delete, Edit } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

function InstructorCourses({ listOfCourses }) {
  const navigate = useNavigate();
  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);
  const { toast } = useToast();

  async function handleEnsureGroupAndJoin(course) {
    try {
      // 1) Fetch existing course group (students already use this join code)
      let groupResponse = null;
      try {
        groupResponse = await getCourseGroupByCourseService(course?._id);
      } catch (err) {
        // If not found, proceed to create; rethrow other errors
        const status = err?.response?.status;
        if (status && status !== 404) throw err;
      }

      // 2) If not found, create one for this course
      if (!groupResponse?.success || !groupResponse?.data) {
        groupResponse = await createCourseGroupService({
          courseId: course?._id,
          name: `${course?.title || "Course"} Group`,
          description: course?.description || "",
        });
      }

      if (!groupResponse?.success || !groupResponse?.data) {
        return toast({
          title: "Group unavailable",
          description: groupResponse?.message || "Could not load group for this course",
          variant: "destructive",
        });
      }

      const group = groupResponse.data;

      // 3) Ensure instructor is a member using the same join code students received
      const joinCode = group?.joinCode;
      if (joinCode) {
        await joinCourseGroupService({ joinCode });
        await navigator.clipboard?.writeText(joinCode);
      }

      toast({
        title: "Group ready",
        description: joinCode
          ? `Join code: ${joinCode} (copied to clipboard)`
          : "Group prepared",
      });

      if (group?._id) {
        navigate(`/instructor/group/${group._id}`);
      }
    } catch (error) {
      toast({
        title: "Group error",
        description: error?.response?.data?.message || error?.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="flex justify-between flex-row items-center">
        <CardTitle className="text-3xl font-extrabold">All Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listOfCourses && listOfCourses.length > 0
                ? listOfCourses.map((course) => (
                    <TableRow>
                      <TableCell className="font-medium">
                        {course?.title}
                      </TableCell>
                      <TableCell>{course?.students?.length}</TableCell>
                      <TableCell>
                        ${course?.students?.length * course?.pricing}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          onClick={() => {
                            navigate(`/instructor/edit-course/${course?._id}`);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEnsureGroupAndJoin(course)}
                        >
                          <Copy className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Delete className="h-6 w-6" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default InstructorCourses;
