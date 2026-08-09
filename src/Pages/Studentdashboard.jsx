import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  Search,
  FileText,
  ClipboardList,
  MessageSquare,
  User,
  Clock,
  TrendingUp,
  CheckCircle,
  ListTodo,
} from "lucide-react";

import HeaderforStudent from "../Components/HeaderforStudent";
import "../Styles/StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [student, setStudent] = useState({});
  const [approvedInternships, setApprovedInternships] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD DASHBOARD DATA
  ========================================================= */

  const loadDashboardData = async () => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("studentProfile");
    const loggedStudent = stored ? JSON.parse(stored) : {};

    setStudent(loggedStudent);

    if (!loggedStudent.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      /* -------------------------------------------------------
         Applications
      ------------------------------------------------------- */

      const appRes = await fetch(
        `https://remote-internship-30135.onrender.com/api/applications/student/${loggedStudent.id}`
      );

      if (!appRes.ok) {
        throw new Error("Failed to load applications");
      }

      const applications = await appRes.json();

      const approved = applications.filter(
        (app) => app.status?.toLowerCase() === "approved"
      );

      setApprovedInternships(approved);

      /* -------------------------------------------------------
         Tasks
      ------------------------------------------------------- */

      const taskRes = await fetch(
        `https://remote-internship-30135.onrender.com/api/tasks/student/${loggedStudent.id}`
      );

      if (!taskRes.ok) {
        throw new Error("Failed to load tasks");
      }

      const taskData = await taskRes.json();

      setTasks(taskData);
    } catch (error) {
      console.error("Dashboard error:", error);

      toast.error(
        "Couldn't load your dashboard. Try refreshing."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadDashboardData();

    window.addEventListener("focus", loadDashboardData);

    return () => {
      window.removeEventListener("focus", loadDashboardData);
    };
  }, []);


  /* =========================================================
     TASK STATISTICS
  ========================================================= */

  const completed = tasks.filter((task) =>
    ["completed", "submitted"].includes(
      task.status?.toLowerCase() ?? ""
    )
  ).length;


  const inProgress = tasks.filter(
    (task) =>
      task.status?.toLowerCase() === "in progress"
  ).length;


  const pending = tasks.filter(
    (task) =>
      task.status?.toLowerCase() === "pending"
  ).length;


  const totalTasks = tasks.length;


  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completed / totalTasks) * 100);


  /* =========================================================
     STAT CARDS
  ========================================================= */

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: ListTodo,
      color: "blue",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: TrendingUp,
      color: "orange",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "purple",
    },
  ];


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      <div className="sd-layout">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="sd-sidebar">

          <nav className="sd-nav">

            <NavButton
              active
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate("/student-dashboard")
              }
            />


            <NavButton
              icon={Search}
              label="Browse Internships"
              onClick={() =>
                navigate("/browse-internships")
              }
            />


            <NavButton
              icon={FileText}
              label="My Applications"
              onClick={() =>
                navigate("/myapplications")
              }
            />


            <NavButton
              icon={ClipboardList}
              label="My Tasks"
              onClick={() =>
                navigate("/mytasks")
              }
            />


            <NavButton
              icon={MessageSquare}
              label="Feedback"
              onClick={() =>
                navigate("/feedback")
              }
            />


            <NavButton
              icon={User}
              label="Profile"
              onClick={() =>
                navigate("/student-profile")
              }
            />

          </nav>

        </aside>


        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <main className="sd-main">

          {loading ? (
            <Loader />
          ) : (
            <>

              {/* =================================================
                  WELCOME
              ================================================= */}

              <div className="sd-header-section">

                <h1>
                  Welcome back,{" "}
                  {student.name || "Student"}!
                </h1>

                <p>
                  Here's an overview of your internship
                  progress.
                </p>

              </div>


              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="sd-stats-grid">

                {stats.map(
                  ({
                    label,
                    value,
                    icon: Icon,
                    color,
                  }) => (

                    <div
                      className="sd-stat-card"
                      key={label}
                    >

                      <div className="sd-stat-info">

                        <p className="sd-stat-label">
                          {label}
                        </p>

                        <h3 className="sd-stat-value">
                          {value}
                        </h3>

                      </div>


                      <div
                        className={`sd-stat-icon ${color}`}
                      >
                        <Icon size={28} />
                      </div>

                    </div>

                  )
                )}

              </div>



              {approvedInternships.length === 0 ? (

                <section className="sd-card">

                  <h2>
                    Current Internship
                  </h2>


                  <div className="sd-empty">

                    <h3>
                      No active internship yet
                    </h3>


                    <p>
                      Once one of your applications
                      is approved, it'll show up here
                      with your start date, duration,
                      and stipend.
                    </p>

                  </div>

                </section>

              ) : (

                approvedInternships.map(
                  (intern, index) => (

                    <section
                      key={index}
                      className="sd-card"
                    >

                      <h2>
                        Current Internship
                      </h2>


                      <h3 className="sd-internship-title">
                        {intern.internshipTitle}
                      </h3>


                      <p className="sd-company">
                        {intern.companyName}
                      </p>


                      <div className="sd-detail-grid">

                        <div className="sd-detail">

                          <strong>
                            Start Date
                          </strong>

                          <p>
                            {intern.appliedDate ||
                              "N/A"}
                          </p>

                        </div>


                        <div className="sd-detail">

                          <strong>
                            Duration
                          </strong>

                          <p>
                            {intern.duration ||
                              "N/A"}
                          </p>

                        </div>


                        <div className="sd-detail">

                          <strong>
                            Stipend
                          </strong>

                          <p>
                            {intern.stipend ||
                              "N/A"}
                          </p>

                        </div>

                      </div>

                    </section>

                  )
                )

              )}


              <section className="sd-card">

                <h2>
                  Progress Overview
                </h2>


                <div className="sd-progress">

                  <div className="sd-progress-track">

                    <div
                      className="sd-progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>


                  <p className="sd-progress-text">

                    {totalTasks === 0
                      ? "No tasks assigned yet"
                      : `${completed} of ${totalTasks} tasks completed (${progress}%)`}

                  </p>

                </div>

              </section>

            </>
          )}

        </main>

      </div>
    </>
  );
}


function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      className={`sd-nav-button ${
        active ? "active" : ""
      }`}
      onClick={onClick}
      aria-current={
        active ? "page" : undefined
      }
    >

      <Icon size={20} />

      <span>
        {label}
      </span>

    </button>
  );
}


/* =============================================================
   LOADER
============================================================= */

function Loader() {
  return (
    <div className="sd-loader">

      <div className="sd-spinner"></div>

      <p>
        Loading your dashboard…
      </p>

    </div>
  );
}
