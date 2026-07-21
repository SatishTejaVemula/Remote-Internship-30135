import React, { useState, useEffect } from "react";
import "../Styles/Cardh.css";
import logo from "../assets/header1.png";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

const HeaderMain = () => {
  const navigate = useNavigate();

  // Default "dark" so the page starts dark on first visit
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Also set on mount immediately so there's no flash
  useEffect(() => {
    document.documentElement.setAttribute("data-theme",
      localStorage.getItem("theme") || "dark"
    );
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <header className="header">
      <div className="left">
        <img
          src={logo}
          alt="Remote Internship"
          className="logo"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="auth-buttons">
          <Link to="/login" className="login">Login</Link>
          <Link to="/register" className="register">Register</Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderMain;