import { courseCategories } from "@/config";
import banner from "../../../../public/banner-img.png";
import { Button } from "@/components/ui/button";
import { useContext, useEffect } from "react";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleNavigateToCoursesPage(getCurrentId) {
    console.log(getCurrentId);
    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [getCurrentId],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  useEffect(() => {
    fetchAllStudentViewCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      <section className="flex flex-col lg:flex-row items-center justify-between py-10 px-4 lg:px-10 gap-8">
        <div className="lg:w-1/2 lg:pr-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border text-xs text-indigo-700">
            ⭐ Personalized learning journeys
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Learning that gets you ahead
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Skills for your present and future. Jump into curated courses, guided paths, and collaborative study groups.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
            <Button variant="outline" onClick={() => navigate("/groups")}>Join a Study Group</Button>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            {[{ label: "Courses", value: "1k+" }, { label: "Instructors", value: "500+" }, { label: "Learners", value: "10k+" }].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/70 border shadow-sm p-3">
                <div className="text-2xl font-bold text-indigo-700">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-70" />
            <div className="absolute -bottom-10 -right-6 w-32 h-32 bg-rose-200 rounded-full blur-3xl opacity-70" />
            <div className="relative bg-white/80 backdrop-blur-xl border shadow-xl rounded-2xl overflow-hidden">
              <img
                src={banner}
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                alt="Study banner"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 rounded-xl p-3 shadow">
                <div className="text-sm font-semibold">Stay on track</div>
                <div className="text-xs text-muted-foreground">Daily streaks, reminders, and group accountability.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 lg:px-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Course Categories</h2>
          <span className="text-sm text-muted-foreground">Tap to filter courses</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {courseCategories.map((categoryItem) => (
            <button
              key={categoryItem.id}
              onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
              className="rounded-xl border bg-white shadow-sm px-3 py-3 text-left text-sm hover:border-indigo-200 hover:shadow transition"
            >
              <div className="font-semibold text-indigo-700">{categoryItem.label}</div>
              <div className="text-xs text-muted-foreground">Explore courses</div>
            </button>
          ))}
        </div>
      </section>

      <section className="py-10 px-4 lg:px-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured Courses</h2>
          <Button variant="ghost" onClick={() => navigate("/courses")}>See all</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem?._id}
                onClick={() => handleCourseNavigate(courseItem?._id)}
                className="group border rounded-2xl overflow-hidden shadow-sm bg-white hover:shadow-lg transition cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={courseItem?.image}
                    width={300}
                    height={150}
                    className="w-full h-40 object-cover"
                    alt={courseItem?.title}
                  />
                  <div className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-1 rounded-full shadow">{courseItem?.category || "Course"}</div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg leading-snug line-clamp-2">{courseItem?.title}</h3>
                  <p className="text-sm text-muted-foreground">{courseItem?.instructorName}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700">${courseItem?.pricing}</span>
                    <span className="text-xs text-muted-foreground">Click to view</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No Courses Found</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;
