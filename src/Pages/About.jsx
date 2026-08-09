import React from "react";

const About = () => {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        <h1 style={styles.title}>
          Remote Internship Management System
        </h1>

        <p style={styles.subtitle}>
          FSAD-PS37 Project — A modern platform designed to streamline and enhance
          remote internship experiences for students and organizations.
        </p>

        <div style={styles.card}>
          <h2 style={styles.heading}>🌐 Project Overview</h2>
          <p>
            This web application enables seamless management and evaluation of
            remote internships. It bridges the gap between students and employers
            by providing a centralized system for task tracking, progress
            monitoring and structured feedback.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>⚙️ Key Features</h2>
          <ul>
            <li> Internship posting and application system</li>
            <li> Real-time task tracking and updates</li>
            <li> Progress monitoring dashboards</li>
            <li> Mentor feedback and evaluation system</li>
            <li> Centralized data management</li>
          </ul>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>👨‍💼 Admin (Employer)</h2>
          <ul>
            <li> Post and manage internship opportunities</li>
            <li> Track intern performance and progress</li>
            <li> Provide evaluations and feedback</li>
            <li> Manage applications efficiently</li>
          </ul>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>🎓 Student (User)</h2>
          <ul>
            <li> Browse and apply for internships</li>
            <li> Track assigned tasks and deadlines</li>
            <li> View feedback from mentors</li>
            <li> Monitor progress and completion status</li>
          </ul>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>🚀 Our Vision</h2>
          <p>
            To create a transparent, efficient, and user-friendly ecosystem for
            remote internships that enhances learning, improves collaboration
            and ensures meaningful evaluation for both students and organizations.
          </p>
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
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020617, #1e293b, #0f172a)",
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: "18px",
    padding: "40px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
    color: "white",
    lineHeight: "1.7",
  },
  title: {
    textAlign: "center",
    fontSize: "32px",
    background: "linear-gradient(90deg,#38bdf8,#7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "15px",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.85,
    marginBottom: "30px",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
  },
  heading: {
    color: "#a5b4fc",
    marginBottom: "10px",
  },
};

export default About;