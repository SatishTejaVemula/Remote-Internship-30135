import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Headerfordash from "../Components/Headerfordash";
import Loader from "../Components/Loader";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  FileText,
  Users,
  UserCheck,
  TrendingUp,
  ClipboardCheck,
  User,
} from "lucide-react";

import "../Styles/AdminDashboard.css";

const AdminDashboard = () => {
  const storedAdmin =
      JSON.parse(
        localStorage.getItem("adminProfile")
      ) || {};
  
    const [admin, setAdmin] =
      useState(storedAdmin);
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD DASHBOARD DATA
  ========================================================= */

  const loadData = async () => {
    try {
      setLoading(true);

      const storedAdmin =
        localStorage.getItem("adminProfile");

      const admin = storedAdmin
        ? JSON.parse(storedAdmin)
        : {};

      const employerId = admin?.id;

      if (!employerId) {
        toast.error("Admin information not found.");
        setLoading(false);
        return;
      }

      /* =========================
         INTERNSHIPS
      ========================= */

      const internshipsRes = await fetch(
        `https://remote-internship-30135.onrender.com/api/internships/employer/${employerId}`
      );

      if (!internshipsRes.ok) {
        throw new Error(
          "Failed to fetch internships"
        );
      }

      const internshipsData =
        await internshipsRes.json();

      /* =========================
         APPLICATIONS
      ========================= */

      const applicationsRes = await fetch(
        `https://remote-internship-30135.onrender.com/api/applications/employer/${employerId}`
      );

      if (!applicationsRes.ok) {
        throw new Error(
          "Failed to fetch applications"
        );
      }

      const applicationsData =
        await applicationsRes.json();

      setInternships(
        Array.isArray(internshipsData)
          ? internshipsData
          : []
      );

      setApplications(
        Array.isArray(applicationsData)
          ? applicationsData
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching dashboard data:",
        error
      );

      setInternships([]);
      setApplications([]);

      toast.error(
        "Couldn't load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadData();

    window.addEventListener(
      "focus",
      loadData
    );

    return () => {
      window.removeEventListener(
        "focus",
        loadData
      );
    };
  }, []);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const underReview = applications.filter(
    (app) => {
      const status =
        app.status?.toUpperCase();

      return (
        status === "UNDER REVIEW" ||
        status === "PENDING"
      );
    }
  ).length;

  const approved = applications.filter(
    (app) =>
      app.status?.toUpperCase() ===
      "APPROVED"
  );

  const avgCompletion =
    approved.length === 0
      ? 0
      : Math.round(
          approved.reduce(
            (sum, app) =>
              sum +
              (Number(app.progress) || 0),
            0
          ) / approved.length
        );

  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (status) => {
    if (!status) return "";

    return status
      .toUpperCase()
      .replace(/\s+/g, "-");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      <div className="admin-layout">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="sd-sidebar">

          <nav className="sd-nav">

            {/* Dashboard */}

            <NavButton
              active
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/admin-dashboard"
                )
              }
            />

            {/* Post Internship */}

            <NavButton
              icon={FileText}
              label="Post Internship"
              onClick={() =>
                navigate(
                  "/post-internship"
                )
              }
            />

            {/* Applications */}

            <NavButton
              icon={Users}
              label="Applications"
              onClick={() =>
                navigate(
                  "/applications"
                )
              }
            />

            {/* Track Progress */}

            <NavButton
              icon={TrendingUp}
              label="Track Progress"
              onClick={() =>
                navigate(
                  "/track-progress"
                )
              }
            />

            {/* Evaluations */}

            <NavButton
              icon={ClipboardCheck}
              label="Evaluations"
              onClick={() =>
                navigate(
                  "/evaluations"
                )
              }
            />

            {/* Profile */}

            <NavButton
              icon={User}
              label="Profile"
              onClick={() =>
                navigate(
                  "/admin-profile"
                )
              }
            />

          </nav>

        </aside>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="sd-main">

          {loading ? (
            <Loader />
          ) : (
            <>
              {/* =============================================
                  PAGE HEADER
              ============================================= */}

              <div className="sd-header-section">

                <h1>
                  {admin.name ||
                "Admin"}'s Dashboard
                </h1>

                <p>
                  Welcome back! Here's an
                  overview of your internship
                  programs.
                </p>

              </div>

              {/* =============================================
                  STATISTICS
              ============================================= */}

              <div className="sd-stats-grid">

                {/* Active Internships */}

                <div
                  className="sd-stat-card"
                  onClick={() =>
                    navigate(
                      "/post-internship"
                    )
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <div className="sd-stat-info">

                    <p className="sd-stat-label">
                      Active Internships
                    </p>

                    <h3 className="sd-stat-value">
                      {internships.length}
                    </h3>

                  </div>

                  <div className="sd-stat-icon blue">
                    <FileText size={28} />
                  </div>

                </div>

                {/* Pending Applications */}

                <div
                  className="sd-stat-card"
                  onClick={() =>
                    navigate(
                      "/applications"
                    )
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <div className="sd-stat-info">

                    <p className="sd-stat-label">
                      Pending Applications
                    </p>

                    <h3 className="sd-stat-value">
                      {underReview}
                    </h3>

                  </div>

                  <div className="sd-stat-icon orange">
                    <Users size={28} />
                  </div>

                </div>

                {/* Active Interns */}

                <div
                  className="sd-stat-card"
                  onClick={() =>
                    navigate(
                      "/applications"
                    )
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <div className="sd-stat-info">

                    <p className="sd-stat-label">
                      Active Interns
                    </p>

                    <h3 className="sd-stat-value">
                      {approved.length}
                    </h3>

                  </div>

                  <div className="sd-stat-icon green">
                    <UserCheck size={28} />
                  </div>

                </div>

                {/* Average Completion */}

                <div
                  className="sd-stat-card"
                  onClick={() =>
                    navigate(
                      "/track-progress"
                    )
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <div className="sd-stat-info">

                    <p className="sd-stat-label">
                      Avg Completion
                    </p>

                    <h3 className="sd-stat-value">
                      {avgCompletion}%
                    </h3>

                  </div>

                  <div className="sd-stat-icon purple">
                    <TrendingUp size={28} />
                  </div>

                </div>

              </div>

              {/* =============================================
                  QUICK ACTIONS
              ============================================= */}

              <section className="sd-card">

                <h2>
                  Quick Actions
                </h2>

                <div className="admin-quick-actions">

                  <button
                    className="admin-quick-action primary"
                    onClick={() =>
                      navigate(
                        "/post-internship"
                      )
                    }
                  >
                    <FileText size={18} />

                    <span>
                      Post New Internship
                    </span>
                  </button>

                  <button
                    className="admin-quick-action"
                    onClick={() =>
                      navigate(
                        "/applications"
                      )
                    }
                  >
                    <Users size={18} />

                    <span>
                      Review Applications
                    </span>
                  </button>

                  <button
                    className="admin-quick-action"
                    onClick={() =>
                      navigate(
                        "/evaluations"
                      )
                    }
                  >
                    <ClipboardCheck
                      size={18}
                    />

                    <span>
                      Create Evaluation
                    </span>
                  </button>

                </div>

              </section>


              {/* =============================================
                  RECENT APPLICATIONS
              ============================================= */}

              <section className="sd-card">

                <h2>
                  Recent Applications
                </h2>

                {applications.length === 0 ? (

                  <div className="admin-empty">
                    No applications found.
                  </div>

                ) : (

                  applications
                    .slice(0, 3)
                    .map((app) => (

                      <div
                        key={app.id}
                        className="admin-recent-card"
                      >

                        <div>

                          <h4>
                            {app.studentName ||
                              app.fullName ||
                              "Student"}
                          </h4>

                          <p>
                            {app.internshipTitle ||
                              app.internship?.title ||
                              "Internship"}
                          </p>

                          <small>
                            Applied:{" "}
                            {app.appliedDate ||
                              "N/A"}
                          </small>

                        </div>

                        <span
                          className={`admin-status-badge ${getStatusClass(
                            app.status
                          )}`}
                        >
                          {app.status ||
                            "Unknown"}
                        </span>

                      </div>

                    ))
                )}

                {applications.length > 0 && (
                  <div
                    className="admin-view-all"
                    onClick={() =>
                      navigate(
                        "/applications"
                      )
                    }
                  >
                    View All Applications →
                  </div>
                )}

              </section>

            </>
          )}

        </main>

      </div>
    </>
  );
};


/* =========================================================
   SIDEBAR BUTTON
========================================================= */

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
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


export default AdminDashboard;