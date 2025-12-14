import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchStudentViewCourseDetailsService,
  checkCoursePurchaseInfoService,
  directEnrollCourseService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Star, Users, Clock, Award, Play, Copy, X } from "lucide-react";

function StudentViewCourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { toast } = useToast();
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showGroupCode, setShowGroupCode] = useState(false);
  const [groupCode, setGroupCode] = useState(null);

  async function fetchCourseDetails() {
    try {
      setLoading(true);
      const response = await fetchStudentViewCourseDetailsService(id);
      if (response?.success) {
        setCourseDetails(response?.data);

        // Check if user is already enrolled
        const purchaseInfo = await checkCoursePurchaseInfoService(
          id,
          auth?.user?._id
        );
        if (purchaseInfo?.success && purchaseInfo?.data) {
          setIsEnrolled(true);
        }
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id && auth?.user?._id) {
      fetchCourseDetails();
    }
  }, [id, auth?.user?._id]);

  async function handleEnrollment() {
    if (!courseDetails) return;

    try {
      setEnrolling(true);
      const enrollData = {
        userId: auth?.user?._id,
        userName: auth?.user?.userName,
        userEmail: auth?.user?.userEmail,
        instructorId: courseDetails?.instructorId,
        instructorName: courseDetails?.instructorName,
        courseImage: courseDetails?.image,
        courseTitle: courseDetails?.title,
        courseId: courseDetails?._id,
        coursePricing: courseDetails?.pricing,
      };

      console.log("Sending enroll request with data:", enrollData);
      const response = await directEnrollCourseService(enrollData);
      console.log("Enroll response:", response);

      if (response?.success) {
        // Store group code and show modal
        if (response?.groupJoinCode) {
          setGroupCode(response?.groupJoinCode);
          setShowGroupCode(true);
        }
        
        toast({
          title: "Success! 🎉",
          description: "You have successfully enrolled in this course.",
        });
        // Refresh course details to update enrolled status
        await fetchCourseDetails();
        
        // Auto-redirect after 4 seconds if no group code shown
        if (!response?.groupJoinCode) {
          setTimeout(() => {
            navigate(`/course-progress/${courseDetails?._id}`);
          }, 1500);
        }
      } else {
        toast({
          title: "Enrollment Failed",
          description: response?.message || "Failed to enroll in course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during enrollment:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Error enrolling in course. Try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Skeleton className="h-96 mb-4" />
        <Skeleton className="h-24 mb-4" />
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Course Not Found</h1>
        <Button onClick={() => navigate("/courses")} className="mt-4">
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Hero Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          {imageError ? (
            <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg mb-6 flex items-center justify-center">
              <span className="text-white text-center font-semibold text-lg">{courseDetails?.title}</span>
            </div>
          ) : (
            <img
              src={courseDetails?.image}
              alt={courseDetails?.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
              onError={() => setImageError(true)}
            />
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{courseDetails?.title}</CardTitle>
              <p className="text-gray-600 mt-2">{courseDetails?.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>{courseDetails?.students?.length || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>{courseDetails?.curriculum?.length || 0} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-5 w-5 text-blue-500" />
                  <span>{courseDetails?.level?.toUpperCase()} Level</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">About this course</h3>
                <p className="text-gray-700 leading-relaxed">
                  {courseDetails?.description}
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">What you'll learn</h3>
                <p className="text-gray-700 leading-relaxed">
                  {courseDetails?.objectives}
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">Course Curriculum</h3>
                <div className="space-y-2">
                  {courseDetails?.curriculum?.map((lecture, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded"
                    >
                      {lecture?.freePreview ? (
                        <Play className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Play className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{lecture?.title}</p>
                        {lecture?.freePreview && (
                          <p className="text-xs text-green-600">Free Preview</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-700">
                      {courseDetails?.instructorName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{courseDetails?.instructorName}</p>
                    <p className="text-sm text-gray-600">Course Instructor</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Enrollment Card */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                ${courseDetails?.pricing}
              </div>
              {isEnrolled && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm font-medium mb-3">
                  ✓ You are enrolled
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {isEnrolled ? (
                <>
                  <Button
                    onClick={() => navigate(`/course-progress/${id}`)}
                    className="w-full"
                    size="lg"
                  >
                    Continue Learning
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/student-courses")}
                    className="w-full"
                  >
                    My Courses
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    className="w-full"
                    size="lg"
                  >
                    {enrolling ? "Processing..." : "Enroll Now"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/courses")}
                    className="w-full"
                  >
                    Back to Courses
                  </Button>
                </>
              )}

              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Learn at your own pace</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>Certificate upon completion</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Group Code Modal */}
      {showGroupCode && groupCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="flex justify-between flex-row items-start">
              <CardTitle className="text-green-600">🎉 Ready to Join the Group!</CardTitle>
              <button
                onClick={() => setShowGroupCode(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Course</p>
                <p className="text-lg font-semibold">{courseDetails?.title}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Your Group Join Code</p>
                <div className="flex items-center gap-2">
                  <code className="text-2xl font-bold tracking-wider text-blue-600">{groupCode}</code>
                  <Button
                    onClick={async () => {
                      await navigator.clipboard?.writeText(groupCode);
                      toast({
                        title: "Copied!",
                        description: "Group code copied to clipboard",
                      });
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Share this code with classmates to join the group chat</p>
              </div>
              <Button
                onClick={() => {
                  setShowGroupCode(false);
                  navigate(`/course-progress/${courseDetails?._id}`);
                }}
                className="w-full"
              >
                Start Learning
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default StudentViewCourseDetailsPage;
