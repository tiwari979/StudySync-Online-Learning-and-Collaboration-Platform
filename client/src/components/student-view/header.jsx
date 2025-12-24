import { GraduationCap, TvMinimalPlay, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials } = useContext(AuthContext);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-neutral-900/70 border-b shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        <div className="flex items-center gap-4">
          <Link to="/home" className="flex items-center hover:text-indigo-700 transition">
            <GraduationCap className="h-8 w-8 mr-3 text-indigo-600" />
            <span className="font-extrabold md:text-xl text-[14px] tracking-tight">
              StudySync
            </span>
          </Link>
          <div className="hidden sm:flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={() => {
                location.pathname.includes("/courses") ? null : navigate("/courses");
              }}
              className="text-[14px] md:text-[15px] font-medium"
            >
              Explore Courses
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                location.pathname.includes("/groups") ? null : navigate("/groups");
              }}
              className="text-[14px] md:text-[15px] font-medium"
            >
              Groups
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                location.pathname.includes("/student/tests") ? null : navigate("/student/tests");
              }}
              className="text-[14px] md:text-[15px] font-medium"
            >
              Tests
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            onClick={() => navigate("/student-courses")}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition"
          >
            <TvMinimalPlay className="w-6 h-6 text-indigo-600" />
            <span className="font-semibold md:text-sm text-[13px]">My Courses</span>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-sm">Sign Out</Button>
        </div>
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
