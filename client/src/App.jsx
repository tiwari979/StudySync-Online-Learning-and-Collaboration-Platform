import { Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/auth";
import RouteGuard from "./components/route-guard";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";
import InstructorDashboardpage from "./pages/instructor";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHomePage from "./pages/student/home";
import NotFoundPage from "./pages/not-found";
import AddNewCoursePage from "./pages/instructor/add-new-course";
import StudentViewCoursesPage from "./pages/student/courses";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import PaypalPaymentReturnPage from "./pages/student/payment-return";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import StudentGroupsPage from "./pages/student/groups";
import GroupDetailPage from "./pages/student/groups/group-detail";
import ResetPasswordPage from "./pages/auth/reset-password";
import AdminDashboard from "./pages/admin";
import ChatbotWidget from "./components/chatbot/ChatbotWidget";
import StudentTestsPage from "./pages/student/tests";
import TakeTestPage from "./pages/student/tests/take-test";
import TestResultsPage from "./pages/student/tests/results";
import TestHistoryPage from "./pages/student/tests/history";
import InstructorTestsPage from "./pages/instructor/tests";
import CreateTestPage from "./pages/instructor/tests/create";

function App() {
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const hideChatbot = 
    location.pathname.startsWith("/auth") || 
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/instructor") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideChatbot && <ChatbotWidget />}
      <Routes>
      <Route
        path="/auth"
        element={
          <RouteGuard
            element={<AuthPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />
      <Route
        path="/instructor"
        element={
          <RouteGuard
            element={<InstructorDashboardpage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/group/:groupId"
        element={
          <RouteGuard
            element={<GroupDetailPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/create-new-course"
        element={
          <RouteGuard
            element={<AddNewCoursePage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/edit-course/:courseId"
        element={
          <RouteGuard
            element={<AddNewCoursePage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/group/:groupId"
        element={
          <RouteGuard
            element={<GroupDetailPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/tests"
        element={
          <RouteGuard
            element={<InstructorTestsPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/tests/create"
        element={
          <RouteGuard
            element={<CreateTestPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/tests/edit/:testId"
        element={
          <RouteGuard
            element={<CreateTestPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/admin"
        element={
          <RouteGuard
            element={<AdminDashboard />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/"
        element={
          <RouteGuard
            element={<StudentViewCommonLayout />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      >
        <Route path="" element={<StudentHomePage />} />
        <Route path="home" element={<StudentHomePage />} />
        <Route path="courses" element={<StudentViewCoursesPage />} />
        <Route
          path="course/details/:id"
          element={<StudentViewCourseDetailsPage />}
        />
        <Route path="payment-return" element={<PaypalPaymentReturnPage />} />
        <Route path="student-courses" element={<StudentCoursesPage />} />
        <Route
          path="course-progress/:id"
          element={<StudentViewCourseProgressPage />}
        />
        <Route path="groups" element={<StudentGroupsPage />} />
        <Route path="groups/:groupId" element={<GroupDetailPage />} />
        <Route path="student/tests" element={<StudentTestsPage />} />
        <Route path="student/tests/take/:id" element={<TakeTestPage />} />
        <Route path="student/tests/results/:id" element={<TestResultsPage />} />
        <Route path="student/tests/history" element={<TestHistoryPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
}

export default App;
