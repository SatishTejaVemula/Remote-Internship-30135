import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeaderforStudent from "../Components/HeaderforStudent";

import "../Styles/StudentDashboard.css";
import "../Styles/Feedback.css";

import toast from "react-hot-toast";

import {
  LayoutDashboard,
  Search,
  FileText,
  ClipboardList,
  MessageSquare,
  Star,
  User,
  TrendingUp,
  Award,
} from "lucide-react";

/* =========================================================
   API + LOCAL STORAGE KEYS
========================================================= */

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY = "token";
const STUDENT_PROFILE_KEY = "studentProfile";
const FEEDBACK_CACHE_KEY =
  "studentFeedbackData";


const Feedback = () => {
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

  const [evaluations, setEvaluations] =
    useState([]);

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
     * Remove student profile
     */
    localStorage.removeItem(
      STUDENT_PROFILE_KEY
    );

    /*
     * Remove feedback cache
     */
    localStorage.removeItem(
      FEEDBACK_CACHE_KEY
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
       * JavaScript Date uses milliseconds.
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
     * If JWT does not contain exp,
     * allow it to continue.
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
       * Automatically logout exactly
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
     LOAD FEEDBACK FROM LOCAL STORAGE
  ========================================================= */

  const loadCachedFeedback = () => {
    try {
      const cached =
        localStorage.getItem(
          FEEDBACK_CACHE_KEY
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

      /*
       * Get current student
       */
      const currentStudent =
        getStudent();

      /*
       * Make sure cache belongs
       * to current student.
       */
      if (
        data.studentId &&
        currentStudent.id &&
        Number(data.studentId) !==
          Number(currentStudent.id)
      ) {
        localStorage.removeItem(
          FEEDBACK_CACHE_KEY
        );

        return false;
      }

      /*
       * Restore evaluations
       */
      setEvaluations(
        Array.isArray(
          data.evaluations
        )
          ? data.evaluations
          : []
      );

      return true;
    } catch (error) {
      console.error(
        "Failed to load cached feedback:",
        error
      );

      localStorage.removeItem(
        FEEDBACK_CACHE_KEY
      );

      return false;
    }
  };


  /* =========================================================
     SAVE FEEDBACK TO LOCAL STORAGE
  ========================================================= */

  const saveFeedbackToCache = (
    evaluationData
  ) => {
    try {
      const cacheData = {
        studentId:
          student?.id,

        evaluations:
          Array.isArray(
            evaluationData
          )
            ? evaluationData
            : [],

        cachedAt: Date.now(),
      };

      localStorage.setItem(
        FEEDBACK_CACHE_KEY,
        JSON.stringify(
          cacheData
        )
      );
    } catch (error) {
      console.error(
        "Failed to cache feedback:",
        error
      );
    }
  };


  /* =========================================================
     LOAD EVALUATIONS FROM API
  ========================================================= */

  const loadEvaluations =
    async () => {
      /*
       * Check JWT before API call
       */
      if (
        !checkTokenExpiration()
      ) {
        return;
      }

      /*
       * Student not available
       */
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
            `${API_BASE}/api/evaluations/student/${student.id}`,
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
            "Failed to load evaluations"
          );
        }

        const data =
          await res.json();

        const evaluationData =
          Array.isArray(data)
            ? data
            : [];

        /*
         * Update state
         */
        setEvaluations(
          evaluationData
        );

        /*
         * Save to localStorage
         */
        saveFeedbackToCache(
          evaluationData
        );
      } catch (error) {
        console.error(
          "Feedback error:",
          error
        );

        setEvaluations([]);

        toast.error(
          "Couldn't load your feedback."
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
     4. Cache exists -> NO API
     5. No cache -> API ONCE
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
     * Try cache first
     */
    const hasCache =
      loadCachedFeedback();

    if (hasCache) {
      /*
       * Cache exists.
       *
       * NO API REQUEST.
       */
      setLoading(false);
    } else {
      /*
       * No cache.
       *
       * Fetch once.
       */
      loadEvaluations();
    }

    /*
     * Cleanup JWT timer
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
     This does NOT fetch feedback.

     It only checks JWT expiration.
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

  const totalFeedback =
    evaluations.length;


  const avgRating =
    totalFeedback === 0
      ? 0
      : (
          evaluations.reduce(
            (sum, item) =>
              sum +
              Number(
                item.rating || 0
              ),
            0
          ) /
          totalFeedback
        ).toFixed(1);


  const performancePercent =
    totalFeedback === 0
      ? 0
      : Math.round(
          (Number(avgRating) /
            5) *
            100
        );


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

            {/* Dashboard */}

            <NavButton
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/student-dashboard"
                )
              }
            />


            {/* Browse */}

            <NavButton
              icon={Search}
              label="Browse Internships"
              onClick={() =>
                navigate(
                  "/browse-internships"
                )
              }
            />


            {/* Applications */}

            <NavButton
              icon={FileText}
              label="My Applications"
              onClick={() =>
                navigate(
                  "/myapplications"
                )
              }
            />


            {/* Tasks */}

            <NavButton
              icon={ClipboardList}
              label="My Tasks"
              onClick={() =>
                navigate(
                  "/mytasks"
                )
              }
            />


            {/* Feedback */}

            <NavButton
              active
              icon={MessageSquare}
              label="Feedback"
              onClick={() =>
                navigate(
                  "/feedback"
                )
              }
            />


            {/* Profile */}

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
              Feedback & Evaluations
            </h1>

            <p>
              View feedback from your
              mentors and track your
              performance.
            </p>

          </div>


          {/* =================================================
              LOADER
          ================================================= */}

          {loading ? (

            <div className="sd-loader">

              <div className="sd-spinner"></div>

              <p>
                Loading your feedback…
              </p>

            </div>

          ) : (

            <>

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <section className="stats-grid">

                {/* Total Feedback */}

                <div className="stat-card">

                  <div className="stat-left">

                    <p>
                      Total Feedback
                    </p>

                    <h3>
                      {totalFeedback}
                    </h3>

                  </div>


                  <div className="stat-icon blue">

                    <MessageSquare
                      size={28}
                    />

                  </div>

                </div>


                {/* Average Rating */}

                <div className="stat-card">

                  <div className="stat-left">

                    <p>
                      Average Rating
                    </p>

                    <h3>
                      {avgRating}/5
                    </h3>

                  </div>


                  <div className="stat-icon orange">

                    <Star
                      size={28}
                    />

                  </div>

                </div>


                {/* Performance */}

                <div className="stat-card">

                  <div className="stat-left">

                    <p>
                      Performance Score
                    </p>

                    <h3>
                      {performancePercent}%
                    </h3>

                  </div>


                  <div className="stat-icon green">

                    <TrendingUp
                      size={28}
                    />

                  </div>

                </div>


                {/* Evaluations */}

                <div className="stat-card">

                  <div className="stat-left">

                    <p>
                      Evaluations
                    </p>

                    <h3>
                      {totalFeedback}
                    </h3>

                  </div>


                  <div className="stat-icon purple">

                    <Award
                      size={28}
                    />

                  </div>

                </div>

              </section>


              {/* =================================================
                  PERFORMANCE OVERVIEW
              ================================================= */}

              <section className="performance-card">

                <h2>
                  Performance Overview
                </h2>


                <p>
                  Overall Performance
                </p>


                <div className="progress-bar">

                  <div
                    className="sd-progress-fill"
                    style={{
                      width:
                        `${performancePercent}%`,
                    }}
                  />

                </div>


                <div className="performance-percent">

                  {performancePercent}%

                </div>

              </section>


              {/* =================================================
                  RECENT FEEDBACK
              ================================================= */}

              <section className="feedback-section">

                <h2>
                  Recent Feedback
                </h2>


                {evaluations.length ===
                0 ? (

                  <div className="no-feedback">

                    <MessageSquare
                      size={32}
                    />

                    <p>
                      No feedback available
                      yet.
                    </p>

                  </div>

                ) : (

                  evaluations.map(
                    (evalItem) => (

                      <div
                        key={
                          evalItem.id
                        }
                        className="evaluation-card"
                      >

                        {/* =====================================
                            INTERNSHIP
                        ===================================== */}

                        <h2>
                          {
                            evalItem.internshipTitle ||
                            "Internship"
                          }
                        </h2>


                        {/* =====================================
                            TASK + RATING
                        ===================================== */}

                        <div className="evaluation-header">

                          <h3>
                            {
                              evalItem.taskTitle ||
                              "Task"
                            }
                          </h3>


                          <strong className="rating-score">

                            ⭐{" "}

                            {
                              evalItem.rating ??
                              0
                            }

                            /5

                          </strong>

                        </div>


                        {/* =====================================
                            TECHNICAL
                        ===================================== */}

                        <p>

                          <strong>
                            Technical:
                          </strong>{" "}

                          {
                            evalItem.technical ||
                            "Not provided"
                          }

                        </p>


                        {/* =====================================
                            COMMUNICATION
                        ===================================== */}

                        <p>

                          <strong>
                            Communication:
                          </strong>{" "}

                          {
                            evalItem.communication ||
                            "Not provided"
                          }

                        </p>


                        {/* =====================================
                            WORK ETHIC
                        ===================================== */}

                        <p>

                          <strong>
                            Work Ethic:
                          </strong>{" "}

                          {
                            evalItem.workEthic ||
                            "Not provided"
                          }

                        </p>


                        {/* =====================================
                            STRENGTHS
                        ===================================== */}

                        <p className="feedback-detail">

                          <strong>
                            Strengths:
                          </strong>{" "}

                          {
                            evalItem.strengths ||
                            "Not provided"
                          }

                        </p>


                        {/* =====================================
                            IMPROVEMENTS
                        ===================================== */}

                        <p>

                          <strong>
                            Areas for Improvement:
                          </strong>{" "}

                          {
                            evalItem.improvements ||
                            "Not provided"
                          }

                        </p>


                        {/* =====================================
                            FEEDBACK
                        ===================================== */}

                        {evalItem.feedback && (

                          <div className="feedback-box">

                            <strong>
                              Feedback:
                            </strong>{" "}

                            {
                              evalItem.feedback
                            }

                          </div>

                        )}

                      </div>

                    )
                  )

                )}

              </section>

            </>

          )}

        </main>

      </div>
    </>
  );
};


/* =============================================================
   SIDEBAR NAV BUTTON
============================================================= */

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


export default Feedback;