import React from "react";
import "../Styles/Header.css";
import logo from "../assets/header1.png";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const HeaderPages = () => {
  const navigate = useNavigate();

  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "dark";

  const toggleTheme = () => {
    const html = document.documentElement;

    if (html.getAttribute("data-theme") === "light") {
      html.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="headerpages">
      <div className="left">
        <img
          src={logo}
          alt="KL University"
          className="logo"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="right">
        <Link to="/" className="home">
          Home
        </Link>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
        >
          {currentTheme === "light" ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
        </button>
      </div>
    </header>
  );
};

export default HeaderPages;