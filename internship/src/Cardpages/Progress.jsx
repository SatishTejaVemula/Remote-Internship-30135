import React from "react";
import { useEffect } from "react";
import Cpheader from "./Cpheader";
import PageNavigation from "../Cardpages/PageNavigation";
import Footer from "../Components/Footer";

const Progress = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Cpheader />
      <PageNavigation current="/progress"/>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #020617, #1e293b, #0f172a)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            borderRadius: "18px",
            padding: "40px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            lineHeight: "1.7",
            color: "white",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              background: "linear-gradient(90deg,#38bdf8,#7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "20px",
            }}
          >
            Progress Report
          </h1>

          <p style={{ opacity: 0.9 }}>
            The <strong>Progress Report</strong> module allows administrators and
            mentors to monitor the development and task completion status of
            interns throughout their internship period.
          </p>

          {/* CARD 1 */}
          <div style={cardStyle}>
            <h2 style={subHeading}>Key Purpose</h2>
            <p>
              This feature ensures transparency in internship performance by
              providing structured tracking of tasks, milestones, and learning
              outcomes achieved by students.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={subHeading}>Main Capabilities</h2>
            <ul>
              <li> Track completion of internship tasks</li>
              <li> View weekly or milestone updates</li>
              <li> Maintain submission history</li>
              <li> Analyze student growth</li>
              <li> Clear documentation of progress</li>
            </ul>
          </div>

          <div style={cardStyle}>
            <h2 style={subHeading}>Benefits</h2>
            <ul>
              <li> Improves accountability and productivity</li>
              <li> Helps mentors give timely feedback</li>
              <li> Ensures measurable learning outcomes</li>
              <li> Transparent evaluation record</li>
            </ul>
          </div>

          <a
            href="/"
            style={{
              display: "block",
              marginTop: "30px",
              textAlign: "center",
              background: "linear-gradient(90deg,#2563eb,#7c3aed)",
              padding: "12px",
              borderRadius: "10px",
              color: "white",
              textDecoration: "none",
              transition: "0.3s",
            }}
          >
            ⬅ Back to Home
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
};

const cardStyle = {
  background: "rgba(255,255,255,0.05)",
  padding: "18px",
  borderRadius: "12px",
  marginTop: "20px",
};

const subHeading = {
  color: "#a5b4fc",
  marginBottom: "10px",
};

export default Progress;