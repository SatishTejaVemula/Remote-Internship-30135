import React from "react";
import { useEffect } from "react";
import PageNavigation from "../Cardpages/PageNavigation";
import Cpheader from "./Cpheader";
import Footer from "../Components/Footer";

const Profile = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Cpheader />
      <PageNavigation current="/profileinfo"/>

      <div style={styles.page}>
        <div style={styles.card}>

          <h1 style={styles.title}>Profile Management</h1>

          <p style={{ opacity: 0.9 }}>
            The <strong>Profile Management</strong> module allows users to maintain
            personal, academic, and internship-related information in one place.
          </p>

          <div style={styles.sectionCard}>
            <h2 style={styles.heading}>Capabilities</h2>
            <ul>
              <li> Edit personal and academic details</li>
              <li> Upload resumes and documents</li>
              <li> Track internship history and achievements</li>
            </ul>
          </div>

          <div style={styles.sectionCard}>
            <h2 style={styles.heading}>Benefits</h2>
            <ul>
              <li> Centralized student identity</li>
              <li> Easy verification for mentors/admins</li>
              <li> Professional digital portfolio</li>
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

export default Profile;

const styles = {
  page: {
    minHeight: "100vh",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "white",
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