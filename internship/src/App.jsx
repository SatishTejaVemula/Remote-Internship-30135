import React from "react";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Mainlayout from "./Layouts/Mainlayout";
import Home from "./Pages/Home";
import Contact from "./Pages/Contact";
import About from "./Pages/About";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Forgetpass from "./Pages/Forgetpass";
import ProtectedRoute from "./Components/ProtectedRoute";

// Admin
import AdminLayout from "./Layouts/AdminLayout";
import Admindashboard from "./Pages/Admindashboard";
import Postinternship from "./Pages/Postinternship";
import Applications from "./Pages/Applications";
import TrackProgress from "./Pages/TrackProgress";
import Evaluations from "./Pages/Evaluations";
import Adminprofile from "./Pages/Adminprofile";

// Student
import StudentLayout from "./Layouts/StudentLayout";
import Studentdashboard from "./Pages/Studentdashboard";
import BrowseInternships from "./Pages/BrowseInternships";
import MyApplications from "./Pages/MyApplications";
import MyTasks from "./Pages/MyTasks";
import Feedback from "./Pages/Feedback";
import Studentprofile from "./Pages/Studentprofile";

// Cards
import Management from "./Cardpages/Management";
import Pio from "./Cardpages/Pio";
import Profileinfo from "./Cardpages/Profileinfo";
import Mentor from "./Cardpages/Mentor";
import Progress from "./Cardpages/Progress";
import Tasks from "./Cardpages/Tasks";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
    <Routes>

      <Route element={<Mainlayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/Forgetpass" element={<Forgetpass />} />

      {/* ================= ADMIN PROTECTED ================= */}
      <Route
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin-dashboard" element={<Admindashboard />} />
        <Route path="/post-internship" element={<Postinternship />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/track-progress" element={<TrackProgress />} />
        <Route path="/evaluations" element={<Evaluations />} />
        <Route path="/admin-profile" element={<Adminprofile />} />
      </Route>

      {/* ================= STUDENT PROTECTED ================= */}
      <Route
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student-dashboard" element={<Studentdashboard />} />
        <Route path="/browse-internships" element={<BrowseInternships />} />
        <Route path="/myapplications" element={<MyApplications />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/mytasks" element={<MyTasks />} />
        <Route path="/student-profile" element={<Studentprofile />} />
      </Route>

      <Route path="/pio" element={<Pio />} />
      <Route path="/management" element={<Management />} />
      <Route path="/profileinfo" element={<Profileinfo />} />
      <Route path="/mentor" element={<Mentor />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/tasks" element={<Tasks />} />

    </Routes>
    </>
  );
};

export default App;