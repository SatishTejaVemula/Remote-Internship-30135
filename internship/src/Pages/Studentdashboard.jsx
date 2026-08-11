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

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY = "token";
const STUDENT_PROFILE_KEY = "studentProfile";
const DASHBOARD_CACHE_KEY = "studentDashboardData";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [student, setStudent] = useState({});
  const [approvedInternships, setApprovedInternships] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STUDENT_PROFILE_KEY);
    localStorage.removeItem(DASHBOARD_CACHE_KEY);

    // Remove these only if your application uses them
    localStorage.removeItem("user");
    localStorage.removeItem("student");

    navigate("/login", { replace: true });
  };

  const getTokenExpiration = () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return null;
    }

    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      );

      if (!payload.exp) {
        return null;
      }

      // JWT exp is in seconds
      return payload.exp * 1000;
    } catch (error) {
      console.error("Invalid JWT:", error);
      return null;
    }
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      logout();
      return false;
    }

    const expirationTime = getTokenExpiration();

    if (!expirationTime) {
      return true;
    }

    if (Date.now() >= expirationTime) {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();
      return false;
    }

    return true;
  };

  const setupTokenExpirationTimer = () => {
    const expirationTime = getTokenExpiration();

    if (!expirationTime) {
      return null;
    }

    const remainingTime = expirationTime - Date.now();

    if (remainingTime <= 0) {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();
      return null;
    }

    const timer = setTimeout(() => {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();
    }, remainingTime);

    return timer;
  };

  const loadCachedDashboard = () => {
    try {
      const cached = localStorage.getItem(
        DASHBOARD_CACHE_KEY
      );

      if (!cached) {
        return false;
      }

      const data = JSON.parse(cached);

      if (!data) {
        return false;
      }

      const storedStudent = localStorage.getItem(
        STUDENT_PROFILE_KEY
      );

      const loggedStudent = storedStudent
        ? JSON.parse(storedStudent)
        : {};

      if (
        data.studentId &&
        loggedStudent.id &&
        Number(data.studentId) !== Number(loggedStudent.id)
      ) {
        localStorage.removeItem(DASHBOARD_CACHE_KEY);

        return false;
      }

      setStudent(loggedStudent);

      setApprovedInternships(
        Array.isArray(data.approvedInternships)
          ? data.approvedInternships
          : []
      );

      setTasks(
        Array.isArray(data.tasks)
          ? data.tasks
          : []
      );

      return true;
    } catch (error) {
      console.error(
        "Failed to load cached dashboard:",
        error
      );

      localStorage.removeItem(DASHBOARD_CACHE_KEY);

      return false;
    }
  };

  const loadDashboardData = async () => {
    if (typeof window === "undefined") {
      return;
    }
    if (!checkTokenExpiration()) {
      return;
    }

    const stored = localStorage.getItem(
      STUDENT_PROFILE_KEY
    );

    const loggedStudent = stored
      ? JSON.parse(stored)
      : {};

    setStudent(loggedStudent);

    if (!loggedStudent.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem(TOKEN_KEY);

      const appRes = await fetch(
        `${API_BASE}/api/applications/student/${loggedStudent.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (
        appRes.status === 401 ||
        appRes.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();
        return;
      }

      if (!appRes.ok) {
        throw new Error(
          "Failed to load applications"
        );
      }

      const applications = await appRes.json();

      const approved = applications.filter(
        (app) =>
          app.status?.toLowerCase() === "approved"
      );

      const taskRes = await fetch(
        `${API_BASE}/api/tasks/student/${loggedStudent.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        taskRes.status === 401 ||
        taskRes.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();
        return;
      }

      if (!taskRes.ok) {
        throw new Error(
          "Failed to load tasks"
        );
      }

      const taskData = await taskRes.json();

      const dashboardData = {
        studentId: loggedStudent.id,
        approvedInternships: approved,
        tasks: taskData,
        cachedAt: Date.now(),
      };

      localStorage.setItem(
        DASHBOARD_CACHE_KEY,
        JSON.stringify(dashboardData)
      );

      setApprovedInternships(approved);
      setTasks(taskData);
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      toast.error(
        "Couldn't load your dashboard. Try refreshing."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkTokenExpiration()) {
      return;
    }

    const timer =
      setupTokenExpirationTimer();
    const hasCache =
      loadCachedDashboard();

    if (hasCache) {
      setLoading(false);
    } else {
      loadDashboardData();
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
      ) {
        checkTokenExpiration();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  const completed = tasks.filter((task) =>
    ["completed", "submitted"].includes(
      task.status?.toLowerCase() ?? ""
    )
  ).length;

  const inProgress = tasks.filter(
    (task) =>
      task.status?.toLowerCase() ===
      "in progress"
  ).length;

  const pending = tasks.filter(
    (task) =>
      task.status?.toLowerCase() ===
      "pending"
  ).length;

  const totalTasks = tasks.length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completed / totalTasks) * 100
        );

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

  return (
    <>
      <div className="sd-layout">

        <aside className="sd-sidebar">
          <nav className="sd-nav">

            <NavButton
              active
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/student-dashboard"
                )
              }
            />

            <NavButton
              icon={Search}
              label="Browse Internships"
              onClick={() =>
                navigate(
                  "/browse-internships"
                )
              }
            />

            <NavButton
              icon={FileText}
              label="My Applications"
              onClick={() =>
                navigate(
                  "/myapplications"
                )
              }
            />

            <NavButton
              icon={ClipboardList}
              label="My Tasks"
              onClick={() =>
                navigate(
                  "/mytasks"
                )
              }
            />

            <NavButton
              icon={MessageSquare}
              label="Feedback"
              onClick={() =>
                navigate(
                  "/feedback"
                )
              }
            />

            <NavButton
              icon={User}
              label="Profile"
              onClick={() =>
                navigate(
                  "/student-profile"
                )
              }
            />

          </nav>
        </aside>

        <main className="sd-main">

          {loading ? (
            <Loader />
          ) : (
            <>

              <div className="sd-header-section">

                <h1>
                  Welcome back,{" "}
                  {student.name ||
                    "Student"}
                  !
                </h1>

                <p>
                  Here's an overview of your
                  internship progress.
                </p>

              </div>

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

              {approvedInternships.length ===
              0 ? (

                <section className="sd-card">

                  <h2>
                    Current Internship
                  </h2>

                  <div className="sd-empty">

                    <h3>
                      No active internship yet
                    </h3>

                    <p>
                      Once one of your
                      applications is
                      approved, it'll show up
                      here with your start
                      date, duration, and
                      stipend.
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
                        {
                          intern.internshipTitle
                        }
                      </h3>

                      <p className="sd-company">
                        {
                          intern.companyName
                        }
                      </p>

                      <div className="sd-detail-grid">

                        <div className="sd-detail">

                          <strong>
                            Start Date
                          </strong>

                          <p>
                            {
                              intern.appliedDate ||
                              "N/A"
                            }
                          </p>

                        </div>

                        <div className="sd-detail">

                          <strong>
                            Duration
                          </strong>

                          <p>
                            {
                              intern.duration ||
                              "N/A"
                            }
                          </p>

                        </div>

                        <div className="sd-detail">

                          <strong>
                            Stipend
                          </strong>

                          <p>
                            {
                              intern.stipend ||
                              "N/A"
                            }
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
        active
          ? "page"
          : undefined
      }
    >
      <Icon size={20} />

      <span>
        {label}
      </span>
    </button>
  );
}

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