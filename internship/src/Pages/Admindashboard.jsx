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


/* =========================================================
   API + LOCAL STORAGE KEYS
========================================================= */

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY = "token";

const ADMIN_PROFILE_KEY =
  "adminProfile";

const ADMIN_DASHBOARD_CACHE_KEY =
  "adminDashboardData";


const AdminDashboard = () => {

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigate = useNavigate();


  /* =========================================================
     ADMIN PROFILE
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


  const storedAdmin =
    getStoredAdmin();


  const [admin, setAdmin] =
    useState(storedAdmin);


  /* =========================================================
     DASHBOARD DATA
  ========================================================= */

  const [internships, setInternships] =
    useState([]);

  const [applications, setApplications] =
    useState([]);


  /* =========================================================
     LOADING
  ========================================================= */

  const [loading, setLoading] =
    useState(true);


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
     * Remove dashboard cache
     */
    localStorage.removeItem(
      ADMIN_DASHBOARD_CACHE_KEY
    );


    /*
     * Remove possible generic auth data
     */
    localStorage.removeItem("user");

    localStorage.removeItem("admin");


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
       * JWT exp = seconds
       * JavaScript = milliseconds
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
     * If exp is not available,
     * allow token to continue.
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


      /*
       * logout()
       * clears:
       * token
       * adminProfile
       * adminDashboardData
       */
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
      if (remainingTime <= 0) {

        toast.error(
          "Your session has expired. Please login again."
        );


        logout();


        return null;
      }


      /*
       * Automatically logout when JWT expires
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
     SAVE DASHBOARD DATA TO LOCAL STORAGE
  ========================================================= */

  const saveDashboardCache = (
    internshipData,
    applicationData,
    adminId
  ) => {

    try {

      const cacheData = {

        adminId,

        internships:
          Array.isArray(
            internshipData
          )
            ? internshipData
            : [],

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
          cacheData
        )
      );

    } catch (error) {

      console.error(
        "Failed to save dashboard cache:",
        error
      );
    }
  };


  /* =========================================================
     LOAD DASHBOARD DATA FROM CACHE
  ========================================================= */

  const loadCachedDashboard =
    () => {

      try {

        const cached =
          localStorage.getItem(
            ADMIN_DASHBOARD_CACHE_KEY
          );


        /*
         * No cache
         */
        if (!cached) {
          return false;
        }


        const data =
          JSON.parse(cached);


        if (!data) {
          return false;
        }


        const currentAdmin =
          getStoredAdmin();


        /*
         * Make sure cache belongs
         * to current admin.
         */
        if (
          data.adminId &&
          currentAdmin.id &&
          Number(data.adminId) !==
            Number(currentAdmin.id)
        ) {

          localStorage.removeItem(
            ADMIN_DASHBOARD_CACHE_KEY
          );


          return false;
        }


        /*
         * Restore internships
         */
        setInternships(
          Array.isArray(
            data.internships
          )
            ? data.internships
            : []
        );


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
          "Failed to load dashboard cache:",
          error
        );


        localStorage.removeItem(
          ADMIN_DASHBOARD_CACHE_KEY
        );


        return false;
      }
    };


  /* =========================================================
     LOAD DASHBOARD DATA FROM API
  ========================================================= */

  const loadData = async () => {

    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    try {

      setLoading(true);


      const currentAdmin =
        getStoredAdmin();


      const employerId =
        currentAdmin?.id;


      /*
       * Update admin state
       */
      setAdmin(
        currentAdmin
      );


      if (!employerId) {

        toast.error(
          "Admin information not found."
        );


        setLoading(false);


        return;
      }


      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      /* =====================================================
         INTERNSHIPS
      ===================================================== */

      const internshipsRes =
        await fetch(
          `${API_BASE}/api/internships/employer/${employerId}`,
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
        internshipsRes.status === 401 ||
        internshipsRes.status === 403
      ) {

        toast.error(
          "Your session has expired. Please login again."
        );


        logout();


        return;
      }


      if (
        !internshipsRes.ok
      ) {

        throw new Error(
          "Failed to fetch internships"
        );
      }


      const internshipsData =
        await internshipsRes.json();


      /* =====================================================
         APPLICATIONS
      ===================================================== */

      const applicationsRes =
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
        applicationsRes.status === 401 ||
        applicationsRes.status === 403
      ) {

        toast.error(
          "Your session has expired. Please login again."
        );


        logout();


        return;
      }


      if (
        !applicationsRes.ok
      ) {

        throw new Error(
          "Failed to fetch applications"
        );
      }


      const applicationsData =
        await applicationsRes.json();


      /* =====================================================
         NORMALIZE DATA
      ===================================================== */

      const internshipData =
        Array.isArray(
          internshipsData
        )
          ? internshipsData
          : [];


      const applicationData =
        Array.isArray(
          applicationsData
        )
          ? applicationsData
          : [];


      /* =====================================================
         UPDATE STATE
      ===================================================== */

      setInternships(
        internshipData
      );


      setApplications(
        applicationData
      );


      /* =====================================================
         SAVE TO CACHE
      ===================================================== */

      saveDashboardCache(
        internshipData,
        applicationData,
        employerId
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

     1. Check JWT
     2. Setup JWT timer
     3. Check cache
     4. Cache exists → NO API
     5. Cache doesn't exist → API ONCE
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
     * Setup automatic JWT logout
     */
    const timer =
      setupTokenExpirationTimer();


    /*
     * Check localStorage first
     */
    const hasCache =
      loadCachedDashboard();


    if (hasCache) {

      /*
       * Cache exists.
       *
       * DO NOT CALL API.
       */
      setLoading(false);

    } else {

      /*
       * Cache doesn't exist.
       *
       * Fetch once.
       */
      loadData();
    }


    /*
     * Cleanup
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
     This does NOT fetch dashboard data.
  ========================================================= */

  useEffect(() => {

    const handleVisibilityChange =
      () => {

        if (
          document.visibilityState ===
          "visible"
        ) {

          /*
           * Only check JWT.
           *
           * NO loadData()
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
     STATISTICS
  ========================================================= */

  const underReview =
    applications.filter(
      (app) => {

        const status =
          app.status?.toUpperCase();


        return (
          status ===
            "UNDER REVIEW" ||
          status ===
            "PENDING"
        );

      }
    ).length;


  const approved =
    applications.filter(
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
              (
                Number(
                  app.progress
                ) || 0
              ),
            0
          ) /
            approved.length
        );


  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (
    status
  ) => {

    if (!status) {
      return "";
    }


    return status
      .toUpperCase()
      .replace(
        /\s+/g,
        "-"
      );
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
                    cursor:
                      "pointer",
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

                    <FileText
                      size={28}
                    />

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
                    cursor:
                      "pointer",
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

                    <Users
                      size={28}
                    />

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
                    cursor:
                      "pointer",
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

                    <UserCheck
                      size={28}
                    />

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
                    cursor:
                      "pointer",
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

                    <TrendingUp
                      size={28}
                    />

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

                    <FileText
                      size={18}
                    />


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

                    <Users
                      size={18}
                    />


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


                {applications.length ===
                0 ? (

                  <div className="admin-empty">

                    No applications found.

                  </div>

                ) : (

                  applications
                    .slice(0, 3)
                    .map(
                      (app) => (

                        <div
                          key={app.id}
                          className="admin-recent-card"
                        >

                          <div>

                            <h4>

                              {
                                app.studentName ||
                                app.fullName ||
                                "Student"
                              }

                            </h4>


                            <p>

                              {
                                app.internshipTitle ||
                                app.internship?.title ||
                                "Internship"
                              }

                            </p>


                            <small>

                              Applied:{" "}

                              {
                                app.appliedDate ||
                                "N/A"
                              }

                            </small>

                          </div>


                          <span
                            className={`admin-status-badge ${getStatusClass(
                              app.status
                            )}`}
                          >

                            {
                              app.status ||
                              "Unknown"
                            }

                          </span>

                        </div>

                      )
                    )

                )}


                {applications.length >
                  0 && (

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
        active
          ? "active"
          : ""
      }`}
      onClick={onClick}
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
}


export default AdminDashboard;