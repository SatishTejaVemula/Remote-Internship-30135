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


/* =========================================================
   API + LOCAL STORAGE KEYS
========================================================= */

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY =
  "token";

const ADMIN_PROFILE_KEY =
  "adminProfile";

const APPLICATIONS_CACHE_KEY =
  "adminApplicationsData";

const ADMIN_DASHBOARD_CACHE_KEY =
  "adminDashboardData";


const Applications = () => {

  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /* =========================================================
     ADMIN
  ========================================================= */

  const getStoredAdmin = () => {

    try {

      const storedAdmin =
        localStorage.getItem(
          ADMIN_PROFILE_KEY
        );


      return storedAdmin
        ? JSON.parse(storedAdmin)
        : {};

    } catch (error) {

      console.error(
        "Failed to read admin profile:",
        error
      );

      return {};
    }
  };


  const admin =
    getStoredAdmin();


  const employerId =
    admin?.id;


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
     * Remove admin profile
     */
    localStorage.removeItem(
      ADMIN_PROFILE_KEY
    );


    /*
     * Remove applications cache
     */
    localStorage.removeItem(
      APPLICATIONS_CACHE_KEY
    );


    /*
     * Remove admin dashboard cache
     */
    localStorage.removeItem(
      ADMIN_DASHBOARD_CACHE_KEY
    );


    /*
     * Remove possible generic auth data
     */
    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "admin"
    );


    /*
     * Redirect
     */
    navigate("/login", {
      replace: true,
    });
  };


  /* =========================================================
     JWT EXPIRATION
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


      if (
        parts.length !== 3
      ) {
        return null;
      }


      const payload =
        JSON.parse(
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
       * JS Date is milliseconds.
       */
      return (
        payload.exp * 1000
      );

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
     * No exp in JWT
     */
    if (!expirationTime) {
      return true;
    }


    /*
     * JWT expired
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
     JWT AUTO LOGOUT TIMER
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
      if (
        remainingTime <= 0
      ) {

        toast.error(
          "Your session has expired. Please login again."
        );


        logout();


        return null;
      }


      /*
       * Logout automatically
       * when JWT expires.
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
     SAVE APPLICATIONS CACHE
  ========================================================= */

  const saveApplicationsCache = (
    applicationData
  ) => {

    try {

      const cacheData = {

        employerId,

        applications:
          Array.isArray(
            applicationData
          )
            ? applicationData
            : [],

        cachedAt:
          Date.now(),
      };


      localStorage.setItem(
        APPLICATIONS_CACHE_KEY,
        JSON.stringify(
          cacheData
        )
      );

    } catch (error) {

      console.error(
        "Failed to save applications cache:",
        error
      );
    }
  };


  /* =========================================================
     UPDATE DASHBOARD APPLICATION CACHE
  ========================================================= */

  const updateDashboardApplicationCache =
    (
      applicationData
    ) => {

      try {

        const existing =
          localStorage.getItem(
            ADMIN_DASHBOARD_CACHE_KEY
          );


        /*
         * Dashboard cache may not exist.
         */
        if (!existing) {
          return;
        }


        const dashboardData =
          JSON.parse(
            existing
          );


        if (!dashboardData) {
          return;
        }


        /*
         * Make sure cache belongs
         * to current admin.
         */
        if (
          dashboardData.adminId &&
          employerId &&
          Number(
            dashboardData.adminId
          ) !==
            Number(employerId)
        ) {
          return;
        }


        const updatedDashboard = {

          ...dashboardData,

          applications:
            Array.isArray(
              applicationData
            )
              ? applicationData
              : [],

          cachedAt:
            Date.now(),
        };


        localStorage.setItem(
          ADMIN_DASHBOARD_CACHE_KEY,
          JSON.stringify(
            updatedDashboard
          )
        );

      } catch (error) {

        console.error(
          "Failed to update dashboard application cache:",
          error
        );
      }
    };


  /* =========================================================
     LOAD APPLICATIONS FROM CACHE
  ========================================================= */

  const loadCachedApplications =
    () => {

      try {

        const cached =
          localStorage.getItem(
            APPLICATIONS_CACHE_KEY
          );


        /*
         * No cache
         */
        if (!cached) {
          return false;
        }


        const data =
          JSON.parse(
            cached
          );


        if (!data) {
          return false;
        }


        /*
         * Make sure cache belongs
         * to current admin.
         */
        if (
          data.employerId &&
          employerId &&
          Number(
            data.employerId
          ) !==
            Number(employerId)
        ) {

          localStorage.removeItem(
            APPLICATIONS_CACHE_KEY
          );


          return false;
        }


        const cachedApplications =
          Array.isArray(
            data.applications
          )
            ? data.applications
            : [];


        setApplications(
          cachedApplications
        );


        return true;

      } catch (error) {

        console.error(
          "Failed to load applications cache:",
          error
        );


        localStorage.removeItem(
          APPLICATIONS_CACHE_KEY
        );


        return false;
      }
    };


  /* =========================================================
     LOAD APPLICATIONS FROM API
  ========================================================= */

  const loadApplications =
    async () => {

      /*
       * Check JWT
       */
      if (
        !checkTokenExpiration()
      ) {
        return;
      }


      if (!employerId) {

        toast.error(
          "Employer not found. Please login again."
        );


        navigate("/login");


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
            `${API_BASE}/api/applications/employer/${employerId}`,
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
            "Failed to load applications"
          );
        }


        const data =
          await res.json();


        const applicationData =
          Array.isArray(data)
            ? data
            : [];


        /*
         * Update React state
         */
        setApplications(
          applicationData
        );


        /*
         * Save page cache
         */
        saveApplicationsCache(
          applicationData
        );


        /*
         * Update dashboard cache
         */
        updateDashboardApplicationCache(
          applicationData
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
     INITIAL LOAD

     1. Check JWT
     2. Setup expiration timer
     3. Check cache
     4. Cache exists → NO API
     5. No cache → API ONCE
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
     * Setup JWT timer
     */
    const timer =
      setupTokenExpirationTimer();


    /*
     * Try cache first
     */
    const hasCache =
      loadCachedApplications();


    if (hasCache) {

      /*
       * Cache exists.
       *
       * DO NOT fetch.
       */
      setLoading(false);

    } else {

      /*
       * No cache.
       *
       * Fetch once.
       */
      loadApplications();
    }


    /*
     * Cleanup
     */
    return () => {

      if (timer) {
        clearTimeout(timer);
      }

    };

  }, [employerId]);


  /* =========================================================
     CHECK JWT WHEN RETURNING TO TAB

     IMPORTANT:
     DOES NOT FETCH APPLICATIONS.
  ========================================================= */

  useEffect(() => {

    const handleVisibilityChange =
      () => {

        if (
          document.visibilityState ===
          "visible"
        ) {

          /*
           * Only JWT check.
           *
           * NO loadApplications()
           */
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
     UPDATE APPLICATION STATUS
  ========================================================= */

  const updateStatus = async (
    id,
    newStatus
  ) => {

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
          `${API_BASE}/api/applications/${id}/status?status=${newStatus}`,
          {
            method: "PUT",

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
          "Failed to update status"
        );
      }


      const updatedApp =
        await res.json();


      /*
       * Update application list
       */
      const updatedApplications =
        applications.map(
          (app) =>
            app.id === id
              ? updatedApp
              : app
        );


      /*
       * Update React state
       */
      setApplications(
        updatedApplications
      );


      /*
       * IMPORTANT:
       * Update localStorage cache.
       */
      saveApplicationsCache(
        updatedApplications
      );


      /*
       * IMPORTANT:
       * Update dashboard cache too.
       */
      updateDashboardApplicationCache(
        updatedApplications
      );


      toast.success(
        newStatus ===
          "APPROVED"
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
          active
            ? "active"
            : ""
        }`}
        onClick={
          onClick
        }
        aria-current={
          active
            ? "page"
            : undefined
        }
      >

        <Icon
          size={20}
        />


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


            {/* Dashboard */}

            <NavButton
              icon={
                LayoutDashboard
              }
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/admin-dashboard"
                )
              }
            />


            {/* Post Internship */}

            <NavButton
              icon={
                FileText
              }
              label="Post Internship"
              onClick={() =>
                navigate(
                  "/post-internship"
                )
              }
            />


            {/* Applications */}

            <NavButton
              active
              icon={
                Users
              }
              label="Applications"
              onClick={() =>
                navigate(
                  "/applications"
                )
              }
            />


            {/* Track Progress */}

            <NavButton
              icon={
                TrendingUp
              }
              label="Track Progress"
              onClick={() =>
                navigate(
                  "/track-progress"
                )
              }
            />


            {/* Evaluations */}

            <NavButton
              icon={
                ClipboardCheck
              }
              label="Evaluations"
              onClick={() =>
                navigate(
                  "/evaluations"
                )
              }
            />


            {/* Profile */}

            <NavButton
              icon={
                User
              }
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

                  <Users
                    size={22}
                  />

                </div>


                <div>

                  <span>
                    Total Applications
                  </span>


                  <strong>
                    {
                      applications.length
                    }
                  </strong>

                </div>

              </div>


              {/* =============================================
                  APPLICATIONS
              ============================================= */}

              {applications.length ===
              0 ? (

                <section className="sd-card">

                  <div className="applications-empty">

                    <Users
                      size={42}
                    />


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
                          key={
                            app.id
                          }
                          className="application-card"
                        >


                          {/* =================================
                              LEFT CONTENT
                          ================================= */}

                          <div className="application-content">


                            <div className="application-title-row">

                              <div>

                                <h2>

                                  {
                                    app
                                      .internship
                                      ?.title ||
                                    app.internshipTitle ||
                                    "Internship"
                                  }

                                </h2>


                                <p className="application-student-name">

                                  {
                                    app.fullName ||
                                    "Student"
                                  }

                                </p>

                              </div>


                              <span
                                className={`application-status ${status.toLowerCase()}`}
                              >

                                {
                                  status.replace(
                                    "-",
                                    " "
                                  )
                                }

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

                                  {
                                    app.email ||
                                    "N/A"
                                  }

                                </strong>

                              </div>


                              <div className="application-detail">

                                <span>
                                  University
                                </span>


                                <strong>

                                  {
                                    app.university ||
                                    "N/A"
                                  }

                                </strong>

                              </div>


                              <div className="application-detail">

                                <span>
                                  GPA
                                </span>


                                <strong>

                                  {
                                    app.gpa ||
                                    "N/A"
                                  }

                                </strong>

                              </div>


                              <div className="application-detail">

                                <span>
                                  Applied Date
                                </span>


                                <strong>

                                  {
                                    app.appliedDate ||
                                    "N/A"
                                  }

                                </strong>

                              </div>

                            </div>


                            {/* =============================
                                RESUME
                            ============================= */}

                            {app.resumePath && (

                              <a
                                href={`${API_BASE}/${app.resumePath}`}
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