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

/* =========================================================
   API + LOCAL STORAGE KEYS
========================================================= */

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY = "token";
const STUDENT_PROFILE_KEY = "studentProfile";
const APPLICATIONS_CACHE_KEY =
  "studentApplicationsData";


const MyApplications = () => {
  const navigate = useNavigate();

  /* =========================================================
     STUDENT
  ========================================================= */

  const getStudent = () => {
    try {
      const storedStudent =
        localStorage.getItem(
          STUDENT_PROFILE_KEY
        );

      return storedStudent
        ? JSON.parse(storedStudent)
        : {};
    } catch (error) {
      console.error(
        "Failed to read student profile:",
        error
      );

      return {};
    }
  };

  const student = getStudent();

  /* =========================================================
     STATE
  ========================================================= */

  const [applications, setApplications] =
    useState([]);

  const [selectedApp, setSelectedApp] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showWithdrawModal, setShowWithdrawModal] =
    useState(false);

  const [withdrawId, setWithdrawId] =
    useState(null);


  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    /*
     * Remove JWT
     */
    localStorage.removeItem(
      TOKEN_KEY
    );

    /*
     * Remove student profile
     */
    localStorage.removeItem(
      STUDENT_PROFILE_KEY
    );

    /*
     * Remove cached applications
     */
    localStorage.removeItem(
      APPLICATIONS_CACHE_KEY
    );

    /*
     * Remove other possible
     * authentication data
     */
    localStorage.removeItem("user");
    localStorage.removeItem("student");

    /*
     * Redirect to login
     */
    navigate("/login", {
      replace: true,
    });
  };


  /* =========================================================
     GET JWT EXPIRATION
  ========================================================= */

  const getTokenExpiration = () => {
    const token =
      localStorage.getItem(
        TOKEN_KEY
      );

    if (!token) {
      return null;
    }

    try {
      const parts =
        token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      /*
       * Decode JWT payload
       */
      const payload = JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      if (!payload.exp) {
        return null;
      }

      /*
       * JWT exp is seconds.
       * JavaScript uses milliseconds.
       */
      return payload.exp * 1000;
    } catch (error) {
      console.error(
        "Invalid JWT:",
        error
      );

      return null;
    }
  };


  /* =========================================================
     CHECK JWT EXPIRATION
  ========================================================= */

  const checkTokenExpiration = () => {
    const token =
      localStorage.getItem(
        TOKEN_KEY
      );

    /*
     * No token
     */
    if (!token) {
      logout();
      return false;
    }

    const expirationTime =
      getTokenExpiration();

    /*
     * If token doesn't contain
     * exp, allow it to continue.
     */
    if (!expirationTime) {
      return true;
    }

    /*
     * Token expired
     */
    if (
      Date.now() >=
      expirationTime
    ) {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();

      return false;
    }

    return true;
  };


  /* =========================================================
     JWT EXPIRATION TIMER
  ========================================================= */

  const setupTokenExpirationTimer =
    () => {
      const expirationTime =
        getTokenExpiration();

      if (!expirationTime) {
        return null;
      }

      const remainingTime =
        expirationTime -
        Date.now();

      /*
       * Already expired
       */
      if (remainingTime <= 0) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return null;
      }

      /*
       * Automatically logout when
       * JWT expires.
       */
      const timer =
        setTimeout(() => {
          toast.error(
            "Your session has expired. Please login again."
          );

          logout();
        }, remainingTime);

      return timer;
    };


  /* =========================================================
     LOAD CACHED APPLICATIONS
  ========================================================= */

  const loadCachedApplications =
    () => {
      try {
        const cached =
          localStorage.getItem(
            APPLICATIONS_CACHE_KEY
          );

        /*
         * No cached data
         */
        if (!cached) {
          return false;
        }

        const data =
          JSON.parse(cached);

        if (!data) {
          return false;
        }

        /*
         * Get current student
         */
        const currentStudent =
          getStudent();

        /*
         * Make sure the cache belongs
         * to the current student.
         */
        if (
          data.studentId &&
          currentStudent.id &&
          Number(data.studentId) !==
            Number(currentStudent.id)
        ) {
          localStorage.removeItem(
            APPLICATIONS_CACHE_KEY
          );

          return false;
        }

        /*
         * Restore applications
         */
        setApplications(
          Array.isArray(
            data.applications
          )
            ? data.applications
            : []
        );

        return true;
      } catch (error) {
        console.error(
          "Failed to load cached applications:",
          error
        );

        localStorage.removeItem(
          APPLICATIONS_CACHE_KEY
        );

        return false;
      }
    };


  /* =========================================================
     SAVE APPLICATIONS TO CACHE
  ========================================================= */

  const saveApplicationsToCache =
    (applicationData) => {
      try {
        const cacheData = {
          studentId:
            student?.id,

          applications:
            Array.isArray(
              applicationData
            )
              ? applicationData
              : [],

          cachedAt: Date.now(),
        };

        localStorage.setItem(
          APPLICATIONS_CACHE_KEY,
          JSON.stringify(
            cacheData
          )
        );
      } catch (error) {
        console.error(
          "Failed to cache applications:",
          error
        );
      }
    };


  /* =========================================================
     FETCH APPLICATIONS FROM API
  ========================================================= */

  const fetchApplications =
    async () => {
      /*
       * Check JWT first
       */
      if (
        !checkTokenExpiration()
      ) {
        return;
      }

      if (!student?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            TOKEN_KEY
          );

        const res =
          await fetch(
            `${API_BASE}/api/applications/student/${student.id}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        /*
         * JWT expired / unauthorized
         */
        if (
          res.status === 401 ||
          res.status === 403
        ) {
          toast.error(
            "Your session has expired. Please login again."
          );

          logout();

          return;
        }

        if (!res.ok) {
          throw new Error(
            "Failed to fetch applications"
          );
        }

        const data =
          await res.json();

        const applicationData =
          Array.isArray(data)
            ? data
            : [];

        /*
         * Update state
         */
        setApplications(
          applicationData
        );

        /*
         * Save to localStorage
         */
        saveApplicationsToCache(
          applicationData
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


  /* =========================================================
     INITIAL LOAD

     1. Check JWT
     2. Setup expiration timer
     3. Check localStorage
     4. If cache exists -> NO API
     5. If cache doesn't exist -> API ONCE
  ========================================================= */

  useEffect(() => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }

    /*
     * Setup automatic logout
     */
    const timer =
      setupTokenExpirationTimer();

    /*
     * First try cached data
     */
    const hasCache =
      loadCachedApplications();

    if (hasCache) {
      /*
       * Cache exists.
       *
       * DO NOT call API.
       */
      setLoading(false);
    } else {
      /*
       * No cache.
       *
       * Fetch only once.
       */
      fetchApplications();
    }

    /*
     * Cleanup timer
     */
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);


  /* =========================================================
     CHECK JWT WHEN RETURNING TO TAB

     IMPORTANT:
     Does NOT fetch applications.

     It only checks whether the JWT
     expired while the user was away.
  ========================================================= */

  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
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


  /* =========================================================
     STATISTICS
  ========================================================= */

  const total =
    applications.length;


  const underReview =
    applications.filter(
      (app) =>
        app.status
          ?.toLowerCase() ===
          "under review" ||
        app.status
          ?.toLowerCase() ===
          "pending"
    ).length;


  const approved =
    applications.filter(
      (app) =>
        app.status
          ?.toLowerCase() ===
        "approved"
    ).length;


  const rejected =
    applications.filter(
      (app) =>
        app.status
          ?.toLowerCase() ===
        "rejected"
    ).length;


  /* =========================================================
     WITHDRAW
  ========================================================= */

  const handleWithdraw =
    (id) => {
      setWithdrawId(id);

      setShowWithdrawModal(
        true
      );
    };


  /* =========================================================
     CONFIRM WITHDRAW
  ========================================================= */

  const confirmWithdraw =
    async () => {
      if (!withdrawId) {
        return;
      }

      /*
       * Check JWT
       */
      if (
        !checkTokenExpiration()
      ) {
        return;
      }

      try {
        const token =
          localStorage.getItem(
            TOKEN_KEY
          );

        const res =
          await fetch(
            `${API_BASE}/api/applications/${withdrawId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        /*
         * JWT expired
         */
        if (
          res.status === 401 ||
          res.status === 403
        ) {
          toast.error(
            "Your session has expired. Please login again."
          );

          logout();

          return;
        }

        if (!res.ok) {
          throw new Error(
            "Failed to withdraw application"
          );
        }

        /*
         * Remove application from state
         */
        const updatedApplications =
          applications.filter(
            (app) =>
              app.id !==
              withdrawId
          );

        setApplications(
          updatedApplications
        );

        /*
         * Update localStorage
         *
         * This is important because
         * otherwise the deleted application
         * would appear again from cache.
         */
        saveApplicationsToCache(
          updatedApplications
        );

        /*
         * Close selected application
         * if it was the withdrawn one.
         */
        if (
          selectedApp?.id ===
          withdrawId
        ) {
          setSelectedApp(null);
        }

        /*
         * Success message
         */
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
        setShowWithdrawModal(
          false
        );

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
                    <FileCheck
                      size={28}
                    />
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
                    <Clock
                      size={28}
                    />
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
                    <CheckCircle
                      size={28}
                    />
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
                    <XCircle
                      size={28}
                    />
                  </div>

                </div>

              </section>


              {/* =================================================
                  NO APPLICATIONS
              ================================================= */}

              {applications.length ===
              0 ? (

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
                        marginTop:
                          "10px",

                        marginBottom:
                          "20px",
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
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: "15px",
                marginBottom:
                  "18px",
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