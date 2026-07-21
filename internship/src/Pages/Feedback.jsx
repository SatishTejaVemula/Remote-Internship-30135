import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderforStudent from "../Components/HeaderforStudent";
import Loader from "../Components/Loader";
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

  const student =
    JSON.parse(localStorage.getItem("studentProfile")) || {};

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student.id) {
      setLoading(false);
      return;
    }

    fetch(`https://remote-internship-30135.onrender.com/api/evaluations/student/${student.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvaluations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalFeedback = evaluations.length;

  const avgRating =
    totalFeedback === 0
      ? 0
      : (
        evaluations.reduce((sum, item) => sum + item.rating, 0) /
        totalFeedback
      ).toFixed(1);

  const performancePercent =
    totalFeedback === 0 ? 0 : Math.round((avgRating / 5) * 100);

  return (
    <>
      <div className="admin-layout" style={{ paddingTop: "70px" }} >

        <aside className="admin-sidebar">
          <button onClick={() => navigate("/student-dashboard")}>
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button onClick={() => navigate("/browse-internships")}>
            <Search size={18} />
            Browse Internships
          </button>

          <button onClick={() => navigate("/myapplications")}>
            <FileText size={18} />
            My Applications
          </button>

          <button onClick={() => navigate("/mytasks")}>
            <ClipboardList size={18} />
            My Tasks
          </button>

          <button className="active">
            <MessageSquare size={18} />
            Feedback
          </button>

          <button onClick={() => navigate("/student-profile")}>
            <User size={18} />
            Profile
          </button>
        </aside>

        <main className="admin-main">
          <div className="page-header">
            <h1>Feedback & Evaluations</h1>
            <p>
              View feedback from your mentors and track your performance.
            </p>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-left">
                    <p>Total Feedback</p>
                    <h3>{totalFeedback}</h3>
                  </div>
                  <MessageSquare className="stat-icon blue" size={30} />
                </div>

                <div className="stat-card">
                  <div className="stat-left">
                    <p>Average Rating</p>
                    <h3>{avgRating}/5</h3>
                  </div>
                  <Star className="stat-icon orange" size={30} />
                </div>

                <div className="stat-card">
                  <div className="stat-left">
                    <p>Performance Score</p>
                    <h3>{performancePercent}%</h3>
                  </div>
                  <TrendingUp className="stat-icon green" size={30} />
                </div>

                <div className="stat-card">
                  <div className="stat-left">
                    <p>Evaluations</p>
                    <h3>{totalFeedback}</h3>
                  </div>
                  <Award className="stat-icon purple" size={30} />
                </div>
              </section>

              <div className="performance-card">
                <h2>Performance Overview</h2>

                <p>Overall Performance</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${performancePercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="feedback-section">
                <h2>Recent Feedback</h2>

                {evaluations.length === 0 ? (
                  <p className="no-feedback">
                    No feedback available yet.
                  </p>
                ) : (
                  evaluations.map((evalItem) => (
                    <div key={evalItem.id} className="evaluation-card">

                      <h2>{evalItem.internshipTitle}</h2>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h3>{evalItem.taskTitle || "Task"}</h3>
                        <strong className="rating-score">
                          ⭐ {evalItem.rating}/5
                        </strong>
                      </div>

                      <p style={{ marginTop: "10px" }}>
                        <strong>Technical:</strong> {evalItem.technical}
                      </p>

                      <p>
                        <strong>Communication:</strong> {evalItem.communication}
                      </p>

                      <p>
                        <strong>Work Ethic:</strong> {evalItem.workEthic}
                      </p>

                      <p style={{ marginTop: "10px" }}>
                        <strong>Strengths:</strong> {evalItem.strengths}
                      </p>

                      <p>
                        <strong>Areas for Improvement:</strong> {evalItem.improvements}
                      </p>

                      {evalItem.feedback && (
                        <div className="feedback-box">
                          <strong>Feedback:</strong> {evalItem.feedback}
                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default Feedback;