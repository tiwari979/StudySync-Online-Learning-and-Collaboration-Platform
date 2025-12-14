import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
  joinCourseGroupService,
} from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronLeft, ChevronRight, Play, Copy } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams, useLocation } from "react-router-dom";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);
  const { toast } = useToast();
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [joined, setJoined] = useState(false);
  const { id } = useParams();

  async function fetchCurrentCourseProgress() {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
        });

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);

          return;
        }

        if (response?.data?.progress?.length === 0) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
        } else {
          console.log("logging here");
          const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

          setCurrentLecture(
            response?.data?.courseDetails?.curriculum[
              lastIndexOfViewedAsTrue + 1
            ]
          );
        }
      }
    }
  }

  async function updateCourseProgress() {
    if (currentLecture) {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );

      if (response?.success) {
        fetchCurrentCourseProgress();
      }
    }
  }

  async function handleJoinGroup() {
    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a join code",
        variant: "destructive",
      });
      return;
    }

    try {
      setJoiningGroup(true);
      const response = await joinCourseGroupService({ joinCode: joinCode.trim() });

      if (response?.success) {
        setJoined(true);
        setJoinCode("");
        toast({
          title: "Success!",
          description: "You've joined the group chat",
        });
        // Navigate to group after 2 seconds
        setTimeout(() => {
          navigate(`/groups/${response?.data?._id}`);
        }, 2000);
      } else {
        toast({
          title: "Failed to join group",
          description: response?.message || "Invalid join code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Error joining group",
        variant: "destructive",
      });
    } finally {
      setJoiningGroup(false);
    }
  }

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      fetchCurrentCourseProgress();
    }
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id]);

  // Handle resume from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lectureId = params.get('lecture');
    
    if (lectureId && studentCurrentCourseProgress?.courseDetails?.curriculum) {
      const lecture = studentCurrentCourseProgress.courseDetails.curriculum.find(
        lec => lec._id === lectureId
      );
      if (lecture) {
        setCurrentLecture(lecture);
      }
    }
  }, [location.search, studentCurrentCourseProgress?.courseDetails]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) updateCourseProgress();
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  console.log(currentLecture, "currentLecture");

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
      <div className="flex items-center justify-between p-4 bg-[#1c1d1f] border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-white hover:text-gray-300"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to My Courses Page
          </Button>
          <h1 className="text-lg font-bold hidden md:block text-white">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
          {isSideBarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${
            isSideBarOpen ? "mr-[400px]" : ""
          } transition-all duration-300 bg-[#1c1d1f]`}
        >
          <VideoPlayer
            width="100%"
            height="500px"
            url={currentLecture?.videoUrl}
            onProgressUpdate={setCurrentLecture}
            progressData={currentLecture}
          />
          <div className="p-6 bg-[#1c1d1f] border-t border-gray-700">
            <h2 className="text-2xl font-bold mb-2 text-white">{currentLecture?.title}</h2>
          </div>
        </div>
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-[#1c1d1f] border-l border-gray-700 transition-all duration-300 ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-[#1c1d1f] w-full grid-cols-3 p-0 h-14 border-b border-gray-700">
              <TabsTrigger
                value="content"
                className="text-white rounded-none h-full hover:bg-gray-800"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="text-white rounded-none h-full hover:bg-gray-800"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="group"
                className="text-white rounded-none h-full hover:bg-gray-800"
              >
                Group
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum.map(
                    (item) => (
                      <div
                        className="flex items-center space-x-2 text-sm text-white font-bold cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
                        key={item._id}
                        onClick={() => setCurrentLecture(item)}
                      >
                        {studentCurrentCourseProgress?.progress?.find(
                          (progressItem) => progressItem.lectureId === item._id
                        )?.viewed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Play className="h-4 w-4 " />
                        )}
                        <span>{item?.title}</span>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4 text-white">About this course</h2>
                  <p className="text-gray-300">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="group" className="flex-1 overflow-hidden p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-white">Course Group Chat</h2>
                    {joined ? (
                      <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                        <p className="text-green-400 text-sm font-semibold mb-3">✓ You've joined the group!</p>
                        <Button
                          onClick={() => navigate(`/student/groups`)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Go to Group Chat
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-gray-300 text-sm">
                          Enter your group join code to join the course group chat with classmates.
                        </p>
                        <div className="space-y-2">
                          <Label className="text-white text-sm">Join Code</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter join code"
                              value={joinCode}
                              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") handleJoinGroup();
                              }}
                              maxLength={6}
                              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                            />
                            <Button
                              onClick={handleJoinGroup}
                              disabled={joiningGroup || !joinCode.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Join
                            </Button>
                          </div>
                          <p className="text-xs text-gray-400">
                            The instructor will provide you with the join code.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You can't view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseCompleteDialog}>
        <DialogContent showOverlay={false} className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
              <div className="flex flex-row gap-3">
                <Button onClick={() => navigate("/student-courses")}>
                  My Courses Page
                </Button>
                <Button onClick={handleRewatchCourse}>Rewatch Course</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
