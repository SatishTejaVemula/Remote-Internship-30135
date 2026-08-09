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


const Feedback = () => {
  const navigate = useNavigate();

  /* =========================================================
     STUDENT
  ========================================================= */

  const student =
    JSON.parse(
      localStorage.getItem("studentProfile")
    ) || {};


  /* =========================================================
     STATE
  ========================================================= */

  const [evaluations, setEvaluations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /* =========================================================
     LOAD EVALUATIONS
  ========================================================= */

  useEffect(() => {
    if (!student?.id) {
      setLoading(false);
      return;
    }

    const loadEvaluations = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token");

        const res = await fetch(
          `https://remote-internship-30135.onrender.com/api/evaluations/student/${student.id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(
            "Failed to load evaluations"
          );
        }

        const data =
          await res.json();

        setEvaluations(
          Array.isArray(data)
            ? data
            : []
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

    loadEvaluations();
  }, [student?.id]);


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
              Number(item.rating || 0),
            0
          ) / totalFeedback
        ).toFixed(1);


  const performancePercent =
    totalFeedback === 0
      ? 0
      : Math.round(
          (Number(avgRating) / 5) *
            100
        );


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      <div className="sd-layout">

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
                navigate("/mytasks")
              }
            />


            {/* Feedback */}

            <NavButton
              active
              icon={MessageSquare}
              label="Feedback"
              onClick={() =>
                navigate("/feedback")
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
                        key={evalItem.id}
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