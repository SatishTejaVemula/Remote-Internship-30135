import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Headerfordash from "../Components/Headerfordash";
import Loader from "../Components/Loader";
import "../Styles/Applications.css";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  ClipboardCheck,
  User,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

const Applications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD APPLICATIONS
  ========================================================= */

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);

      const storedAdmin =
        localStorage.getItem("adminProfile");

      const loggedEmployer = storedAdmin
        ? JSON.parse(storedAdmin)
        : {};

      const employerId = loggedEmployer?.id;

      const token =
        localStorage.getItem("token");

      if (!employerId) {
        toast.error(
          "Employer not found. Please login again."
        );

        navigate("/login");
        return;
      }

      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/applications/employer/${employerId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load applications"
        );
      }

      const data = await res.json();

      setApplications(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Applications error:",
        error
      );

      setApplications([]);

      toast.error(
        "Couldn't load applications."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     UPDATE APPLICATION STATUS
  ========================================================= */

  const updateStatus = async (
    id,
    newStatus
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/applications/${id}/status?status=${newStatus}`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to update status"
        );
      }

      const updatedApp =
        await res.json();

      setApplications((previous) =>
        previous.map((app) =>
          app.id === id
            ? updatedApp
            : app
        )
      );

      toast.success(
        newStatus === "APPROVED"
          ? "Application approved."
          : "Application rejected."
      );
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      toast.error(
        "Unable to update application."
      );
    }
  };


  /* =========================================================
     NAV BUTTON
  ========================================================= */

  const NavButton = ({
    active,
    icon: Icon,
    label,
    onClick,
  }) => {
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
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      <div className="admin-layout">


        {/* ===================================================
            FIXED SIDEBAR
        =================================================== */}

        <aside className="sd-sidebar">

          <nav className="sd-nav">

            <NavButton
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/admin-dashboard"
                )
              }
            />

            <NavButton
              icon={FileText}
              label="Post Internship"
              onClick={() =>
                navigate(
                  "/post-internship"
                )
              }
            />

            <NavButton
              active
              icon={Users}
              label="Applications"
              onClick={() =>
                navigate(
                  "/applications"
                )
              }
            />

            <NavButton
              icon={TrendingUp}
              label="Track Progress"
              onClick={() =>
                navigate(
                  "/track-progress"
                )
              }
            />

            <NavButton
              icon={ClipboardCheck}
              label="Evaluations"
              onClick={() =>
                navigate(
                  "/evaluations"
                )
              }
            />

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
                  Student Applications
                </h1>

                <p>
                  Review internship
                  applications from students.
                </p>

              </div>


              {/* =============================================
                  APPLICATION COUNT
              ============================================= */}

              <div className="applications-summary">

                <div className="applications-summary-icon">
                  <Users size={22} />
                </div>

                <div>
                  <span>
                    Total Applications
                  </span>

                  <strong>
                    {applications.length}
                  </strong>
                </div>

              </div>


              {/* =============================================
                  APPLICATIONS
              ============================================= */}

              {applications.length === 0 ? (

                <section className="sd-card">

                  <div className="applications-empty">

                    <Users size={42} />

                    <h3>
                      No applications yet
                    </h3>

                    <p>
                      Student applications
                      will appear here when
                      students apply for your
                      internships.
                    </p>

                  </div>

                </section>

              ) : (

                <div className="applications-list">

                  {applications.map(
                    (app) => {

                      const status =
                        app.status
                          ?.toUpperCase() ||
                        "PENDING";

                      return (
                        <article
                          key={app.id}
                          className="application-card"
                        >

                          {/* =================================
                              LEFT CONTENT
                          ================================= */}

                          <div className="application-content">

                            <div className="application-title-row">

                              <div>

                                <h2>
                                  {app.internship
                                    ?.title ||
                                    app.internshipTitle ||
                                    "Internship"}
                                </h2>

                                <p className="application-student-name">
                                  {app.fullName ||
                                    "Student"}
                                </p>

                              </div>


                              <span
                                className={`application-status ${status.toLowerCase()}`}
                              >
                                {status.replace(
                                  "-",
                                  " "
                                )}
                              </span>

                            </div>


                            {/* =============================
                                STUDENT DETAILS
                            ============================= */}

                            <div className="application-details">

                              <div className="application-detail">

                                <span>
                                  Email
                                </span>

                                <strong>
                                  {app.email ||
                                    "N/A"}
                                </strong>

                              </div>


                              <div className="application-detail">

                                <span>
                                  University
                                </span>

                                <strong>
                                  {app.university ||
                                    "N/A"}
                                </strong>

                              </div>


                              <div className="application-detail">

                                <span>
                                  GPA
                                </span>

                                <strong>
                                  {app.gpa ||
                                    "N/A"}
                                </strong>

                              </div>


                              <div className="application-detail">

                                <span>
                                  Applied Date
                                </span>

                                <strong>
                                  {app.appliedDate ||
                                    "N/A"}
                                </strong>

                              </div>

                            </div>


                            {/* =============================
                                RESUME
                            ============================= */}

                            {app.resumePath && (
                              <a
                                href={`https://remote-internship-30135.onrender.com/${app.resumePath}`}
                                target="_blank"
                                rel="noreferrer"
                                className="resume-link"
                              >
                                <ExternalLink
                                  size={16}
                                />

                                View Resume
                              </a>
                            )}

                          </div>


                          {/* =================================
                              RIGHT ACTIONS
                          ================================= */}

                          <div className="application-actions">

                            {status ===
                              "PENDING" && (
                              <>

                                <button
                                  type="button"
                                  className="approve-btn"
                                  onClick={() =>
                                    updateStatus(
                                      app.id,
                                      "APPROVED"
                                    )
                                  }
                                >
                                  <CheckCircle
                                    size={17}
                                  />

                                  Approve
                                </button>


                                <button
                                  type="button"
                                  className="reject-btn"
                                  onClick={() =>
                                    updateStatus(
                                      app.id,
                                      "REJECTED"
                                    )
                                  }
                                >
                                  <XCircle
                                    size={17}
                                  />

                                  Reject
                                </button>

                              </>
                            )}


                            {status ===
                              "APPROVED" && (

                              <div className="status-approved">

                                <CheckCircle
                                  size={18}
                                />

                                Approved

                              </div>

                            )}


                            {status ===
                              "REJECTED" && (

                              <div className="status-rejected">

                                <XCircle
                                  size={18}
                                />

                                Rejected

                              </div>

                            )}

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>

              )}

            </>
          )}

        </main>

      </div>
    </>
  );
};

export default Applications;