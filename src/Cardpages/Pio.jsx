import React from "react";
import { useEffect } from "react";
import PageNavigation from "../Cardpages/PageNavigation";
import Cpheader from "./Cpheader";
import Footer from "../Components/Footer";

const Pio = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Cpheader />
      <PageNavigation current="/pio"/>

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
            Post Internship Opportunities
          </h1>

          <p style={{ opacity: 0.9 }}>
            The <strong>Post Internship Opportunities</strong> feature allows
            administrators to create, manage, and publish internship openings
            for students in a centralized remote internship management system.
          </p>

          <div style={cardStyle}>
            <h2 style={subHeading}>Key Purpose</h2>
            <p>
              This module ensures that internship opportunities are clearly
              described, properly organized, and easily accessible to students
              seeking real-world experience.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={subHeading}>Main Capabilities</h2>
            <ul>
              <li> Create internship listings with role, duration, and requirements.</li>
              <li> Provide detailed descriptions and expected outcomes.</li>
              <li> Update or remove outdated postings.</li>
              <li> Allow students to view and apply.</li>
              <li> Maintain centralized database.</li>
            </ul>
          </div>

          <div style={cardStyle}>
            <h2 style={subHeading}>Benefits</h2>
            <ul>
              <li> Simplifies internship management for admins.</li>
              <li> Improves visibility for students.</li>
              <li> Ensures transparency and workflow.</li>
              <li> Supports remote ecosystems.</li>
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

export default Pio;