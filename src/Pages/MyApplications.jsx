import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeaderforStudent from "../Components/HeaderforStudent";

import "../Styles/StudentDashboard.css";
import "../Styles/MyApplications.css";

import toast from "react-hot-toast";

import {
  LayoutDashboard,
  Search,
  FileText,
  ClipboardList,
  MessageSquare,
  User,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  X,
} from "lucide-react";


const MyApplications = () => {
  const navigate = useNavigate();

  /* =========================================================
     STUDENT
  ========================================================= */

  const student =
    JSON.parse(localStorage.getItem("studentProfile")) || {};


  /* =========================================================
     STATE
  ========================================================= */

  const [applications, setApplications] = useState([]);

  const [selectedApp, setSelectedApp] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showWithdrawModal, setShowWithdrawModal] =
    useState(false);

  const [withdrawId, setWithdrawId] =
    useState(null);


  /* =========================================================
     FETCH APPLICATIONS
  ========================================================= */

  useEffect(() => {
    if (!student?.id) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token");

        const res = await fetch(
          `https://remote-internship-30135.onrender.com/api/applications/student/${student.id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(
            "Failed to fetch applications"
          );
        }

        const data = await res.json();

        setApplications(
          Array.isArray(data) ? data : []
        );

      } catch (err) {
        console.error(
          "Applications error:",
          err
        );

        setApplications([]);

        toast.error(
          "Couldn't load your applications."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [student?.id]);


  /* =========================================================
     STATISTICS
  ========================================================= */

  const total =
    applications.length;


  const underReview =
    applications.filter(
      (app) =>
        app.status?.toLowerCase() ===
          "under review" ||
        app.status?.toLowerCase() ===
          "pending"
    ).length;


  const approved =
    applications.filter(
      (app) =>
        app.status?.toLowerCase() ===
        "approved"
    ).length;


  const rejected =
    applications.filter(
      (app) =>
        app.status?.toLowerCase() ===
        "rejected"
    ).length;


  /* =========================================================
     WITHDRAW
  ========================================================= */

  const handleWithdraw = (id) => {
    setWithdrawId(id);

    setShowWithdrawModal(true);
  };


  const confirmWithdraw = async () => {
    if (!withdrawId) return;

    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/applications/${withdrawId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to withdraw application"
        );
      }


      setApplications((prev) =>
        prev.filter(
          (app) =>
            app.id !== withdrawId
        )
      );


      if (
        selectedApp?.id ===
        withdrawId
      ) {
        setSelectedApp(null);
      }


      toast.success(
        "Application withdrawn successfully"
      );

    } catch (err) {
      console.error(
        "Withdraw error:",
        err
      );

      toast.error(
        "Failed to withdraw application"
      );

    } finally {
      setShowWithdrawModal(false);

      setWithdrawId(null);
    }
  };


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
              active
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
                navigate(
                  "/student-profile"
                )
              }
            />

          </nav>

        </aside>


        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <main className="sd-main">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="page-header">

            <h1>
              My Applications
            </h1>

            <p>
              Track the status of your
              internship applications.
            </p>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="sd-loader">

              <div className="sd-spinner"></div>

              <p>
                Loading your applications…
              </p>

            </div>

          ) : (

            <>


              {/* =================================================
                  STATISTICS
              ================================================= */}

              <section className="stats-grid">


                {/* Total */}

                <div className="stat-card">

                  <div className="stat-left">

                    <p>
                      Total Applications
                    </p>

                    <h3>
                      {total}
                    </h3>

                  </div>

                  <div className="stat-icon blue">
                    <FileCheck size={28} />
                  </div>

                </div>


                {/* Under Review */}

                <div className="stat-card">

                  <div className="stat-left">

                    <p>
                      Under Review
                    </p>

                    <h3>
                      {underReview}
                    </h3>

                  </div>

                  <div className="stat-icon orange">
                    <Clock size={28} />
                  </div>

                </div>


                {/* Approved */}

                <div className="stat-card">

                  <div className="stat-left">

                    <p>
                      Approved
                    </p>

                    <h3>
                      {approved}
                    </h3>

                  </div>

                  <div className="stat-icon green">
                    <CheckCircle size={28} />
                  </div>

                </div>


                {/* Rejected */}

                <div className="stat-card">

                  <div className="stat-left">

                    <p>
                      Rejected
                    </p>

                    <h3>
                      {rejected}
                    </h3>

                  </div>

                  <div className="stat-icon purple">
                    <XCircle size={28} />
                  </div>

                </div>

              </section>


              {/* =================================================
                  NO APPLICATIONS
              ================================================= */}

              {applications.length === 0 ? (

                <section className="dashboard-card">

                  <h2>
                    No Applications Yet
                  </h2>

                  <p>
                    You haven't applied to
                    any internships yet.
                  </p>

                  <button
                    className="view-button"
                    onClick={() =>
                      navigate(
                        "/browse-internships"
                      )
                    }
                  >
                    Browse Internships
                  </button>

                </section>

              ) : (

                /* =================================================
                   APPLICATIONS
                ================================================= */

                <div className="application-list">

                  {applications.map(
                    (app) => (

                      <div
                        key={app.id}
                        className="application-card"
                      >


                        {/* =======================================
                            APPLICATION INFORMATION
                        ======================================= */}

                        <div>

                          <h3>
                            {
                              app.internshipTitle ||
                              "Internship"
                            }
                          </h3>


                          <p>
                            {
                              app.companyName ||
                              "Company"
                            }
                          </p>


                          {/* Meta */}

                          <div className="progress-meta">

                            <div>

                              <MapPin
                                size={16}
                              />

                              <span>
                                {
                                  app.location ||
                                  "Remote"
                                }
                              </span>

                            </div>


                            <div>

                              <Calendar
                                size={16}
                              />

                              <span>
                                Applied:{" "}
                                {
                                  app.appliedDate ||
                                  "N/A"
                                }
                              </span>

                            </div>

                          </div>


                          {/* =====================================
                              APPROVED
                          ===================================== */}

                          {app.status
                            ?.toLowerCase() ===
                            "approved" && (

                            <div className="approved-box">

                              <span>
                                🎉 Congratulations!
                                Your application
                                has been approved.
                              </span>

                            </div>

                          )}


                          {/* =====================================
                              PENDING
                          ===================================== */}

                          {(
                            app.status
                              ?.toLowerCase() ===
                              "under review" ||
                            app.status
                              ?.toLowerCase() ===
                              "pending"
                          ) && (

                            <div className="application-pending">

                              ⏳ Your application
                              is currently
                              under review.

                            </div>

                          )}


                          {/* =====================================
                              REJECTED
                          ===================================== */}

                          {app.status
                            ?.toLowerCase() ===
                            "rejected" && (

                            <div className="application-rejected">

                              ❌ Unfortunately,
                              your application
                              was rejected.

                            </div>

                          )}

                        </div>


                        {/* =======================================
                            ACTIONS
                        ======================================= */}

                        <div className="application-actions">


                          {/* Status */}

                          <span
                            className={`status-badge ${
                              app.status
                                ?.toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )
                            }`}
                          >
                            {app.status ||
                              "Unknown"}
                          </span>


                          {/* View */}

                          <button
                            className="view-button"
                            onClick={() =>
                              setSelectedApp(
                                app
                              )
                            }
                          >
                            View
                          </button>


                          {/* Withdraw */}

                          {(
                            app.status
                              ?.toLowerCase() ===
                              "under review" ||
                            app.status
                              ?.toLowerCase() ===
                              "pending"
                          ) && (

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleWithdraw(
                                  app.id
                                )
                              }
                            >
                              Withdraw
                            </button>

                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}


              {/* =================================================
                  WITHDRAW CONFIRMATION MODAL
              ================================================= */}

              {showWithdrawModal && (

                <div
                  className="modal-overlay"
                  onClick={() =>
                    setShowWithdrawModal(
                      false
                    )
                  }
                >

                  <div
                    className="modal-container"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <h3>
                      Withdraw Application?
                    </h3>


                    <p
                      style={{
                        marginTop: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      This action cannot
                      be undone.
                    </p>


                    <div className="modal-actions">

                      <button
                        onClick={() =>
                          setShowWithdrawModal(
                            false
                          )
                        }
                        className="cancel-btn"
                      >
                        Cancel
                      </button>


                      <button
                        onClick={
                          confirmWithdraw
                        }
                        className="withdraw-btn"
                      >
                        Withdraw
                      </button>

                    </div>

                  </div>

                </div>

              )}

            </>

          )}

        </main>

      </div>


      {/* =====================================================
          APPLICATION DETAILS MODAL
      ===================================================== */}

      {selectedApp && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedApp(null)
          }
        >

          <div
            className="modal-container"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal header */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "15px",
                marginBottom: "18px",
              }}
            >

              <h2
                style={{
                  margin: 0,
                }}
              >
                {
                  selectedApp.internshipTitle ||
                  "Internship"
                }
              </h2>


              <button
                className="modal-close-btn"
                onClick={() =>
                  setSelectedApp(null)
                }
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>


            {/* Details */}

            <p>
              <strong>
                Company:
              </strong>{" "}
              {
                selectedApp.companyName ||
                "N/A"
              }
            </p>


            <p>
              <strong>
                Location:
              </strong>{" "}
              {
                selectedApp.location ||
                "Remote"
              }
            </p>


            <p>
              <strong>
                Description:
              </strong>{" "}
              {
                selectedApp.description ||
                "No description available."
              }
            </p>


            <p>
              <strong>
                Role Applied:
              </strong>{" "}
              {
                selectedApp.role ||
                "N/A"
              }
            </p>


            <p>
              <strong>
                University:
              </strong>{" "}
              {
                selectedApp.university ||
                "N/A"
              }
            </p>


            <p>
              <strong>
                Status:
              </strong>{" "}
              {
                selectedApp.status ||
                "N/A"
              }
            </p>


            <p>
              <strong>
                Applied Date:
              </strong>{" "}
              {
                selectedApp.appliedDate ||
                "N/A"
              }
            </p>


            {/* Modal action */}

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={() =>
                  setSelectedApp(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};


/* =============================================================
   SIDEBAR NAVIGATION BUTTON
============================================================= */

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


export default MyApplications;