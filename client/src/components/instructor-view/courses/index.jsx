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
import { createCourseGroupService } from "@/services";
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

  async function handleCreateGroup(course) {
    try {
      const response = await createCourseGroupService({
        courseId: course?._id,
        name: `${course?.title || "Course"} Group`,
        description: course?.description || "",
      });

      if (response?.success) {
        const joinCode = response?.data?.joinCode;
        if (joinCode) {
          await navigator.clipboard?.writeText(joinCode);
        }
        toast({
          title: "Group ready",
          description: joinCode
            ? `Join code: ${joinCode} (copied to clipboard)`
            : "Group created",
        });
      } else {
        toast({
          title: "Failed to create group",
          description: response?.message || "Unexpected error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to create group",
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
                          onClick={() => handleCreateGroup(course)}
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
