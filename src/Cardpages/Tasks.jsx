import React from "react";
import { useEffect } from "react";
import Cpheader from "./Cpheader";
import PageNavigation from "../Cardpages/PageNavigation";
import Footer from "../Components/Footer";

const Tasks = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Cpheader />
      <PageNavigation current="/tasks"/>

      <div style={styles.page}>
        <div style={styles.card}>

          <h1 style={styles.title}>Apply & Track Tasks</h1>

          <p style={{ opacity: 0.9 }}>
            Students can apply for internships, view assigned tasks, submit work,
            and monitor completion status throughout their internship journey.
          </p>

          <div style={styles.sectionCard}>
            <h2 style={styles.heading}>Main Features</h2>
            <ul>
              <li> Task assignment with deadlines</li>
              <li> Submission tracking system</li>
              <li> Performance monitoring</li>
            </ul>
          </div>

          <a href="/" style={styles.back}>
            ⬅ Back to Home
          </a>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Tasks;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "white",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    maxWidth: "900px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: "18px",
    padding: "40px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
    lineHeight: "1.7",
  },

  title: {
    textAlign: "center",
    background: "linear-gradient(90deg,#38bdf8,#7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "20px",
  },

  heading: {
    color: "#a5b4fc",
    marginBottom: "10px",
  },

  sectionCard: {
    background: "rgba(255,255,255,0.05)",
    padding: "18px",
    borderRadius: "12px",
    marginTop: "20px",
  },

  back: {
    display: "block",
    marginTop: "30px",
    textAlign: "center",
    background: "linear-gradient(90deg,#2563eb,#7c3aed)",
    padding: "12px",
    borderRadius: "10px",
    color: "white",
    textDecoration: "none",
    transition: "0.3s",
  },
};