import React, { useEffect, useState } from "react";
import {
  LogOut,
  GraduationCap,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Styles/HeaderforStudent.css";

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const DEFAULT_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const HeaderforStudent = () => {
  const navigate = useNavigate();

  const storedStudent =
    JSON.parse(
      localStorage.getItem("studentProfile")
    ) || {};

  const [student, setStudent] =
    useState(storedStudent);

  const [imgLoading, setImgLoading] =
    useState(true);

  /* =========================================================
     THEME
     ========================================================= */

  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("theme") ||
      "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "theme",
      theme
    );
  }, [theme]);

  /* =========================================================
     LOAD STUDENT PROFILE
     ========================================================= */

  useEffect(() => {
    if (!storedStudent?.id) {
      setImgLoading(false);
      return;
    }

    const cached =
      localStorage.getItem(
        "studentProfileFull"
      );

    if (cached) {
      try {
        const parsed =
          JSON.parse(cached);

        setStudent(parsed);

      } catch (error) {
        console.error(
          "Invalid cached student profile:",
          error
        );
      }
    }

    const token =
      localStorage.getItem("token");

    fetch(
      `${API_BASE}/api/students/${storedStudent.id}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Failed to fetch student profile"
          );
        }

        return res.json();
      })
      .then((data) => {

        /* IMPORTANT:
           Update the actual header state
           with the latest backend data.
        */

        setStudent(data);

        /* Keep localStorage synchronized */

        localStorage.setItem(
          "studentProfile",
          JSON.stringify(data)
        );

        localStorage.setItem(
          "studentProfileFull",
          JSON.stringify(data)
        );

        setImgLoading(false);
      })
      .catch((err) => {
        console.error(
          "Student profile error:",
          err
        );

        setImgLoading(false);
      });

  }, [storedStudent?.id]);

  /* =========================================================
     IMAGE URL
     ========================================================= */

  const getImageUrl = () => {
    if (!student?.image) {
      return DEFAULT_IMAGE;
    }

    if (
      student.image === "default"
    ) {
      return DEFAULT_IMAGE;
    }

    if (
      student.image.startsWith("data:")
    ) {
      return student.image;
    }

    return `${API_BASE}/api/students/image/${encodeURIComponent(
      student.image
    )}`;
  };

  /* =========================================================
     THEME TOGGLE
     ========================================================= */

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark"
    );
  };

  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = () => {
    localStorage.clear();

    window.location.href = "/";
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <header className="dash-header">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <h2
        className="logo-title"
        onClick={() =>
          navigate("/student-dashboard")
        }
      >
        <GraduationCap size={24} />

        InternHub Student
      </h2>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="dash-right">

        {/* ===================================================
            STUDENT INFORMATION
        =================================================== */}

        <div className="header-user-info">

          <a
            href="/student-profile"
            className="headerloname"
          >
            <strong className="student-name">
              {student.name ||
                "Student"}
            </strong>
          </a>

          <div
            onClick={() =>
              navigate(
                "/student-profile"
              )
            }
            className="student-email"
          >
            {student.email ||
              "student@gmail.com"}
          </div>

        </div>


        {/* ===================================================
            PROFILE IMAGE
        =================================================== */}

        <div
          onClick={() =>
            navigate(
              "/student-profile"
            )
          }
          style={{
            cursor: "pointer",
          }}
        >

          {imgLoading && (
            <div className="avatar-skeleton"></div>
          )}

          <img
            key={student.image || "default"}
            loading="eager"
            src={getImageUrl()}
            alt="profile"

            onLoad={() => {
              setImgLoading(false);
            }}

            onError={(e) => {

              console.error(
                "Profile image failed:",
                getImageUrl()
              );

              /*
               * NEVER request:
               *
               * /api/students/image/default
               *
               * Always use the external
               * fallback image.
               */

              if (
                e.currentTarget.src !==
                DEFAULT_IMAGE
              ) {
                e.currentTarget.src =
                  DEFAULT_IMAGE;
              }

              setImgLoading(false);
            }}

            className="profile-avatar"
          />

        </div>


        {/* ===================================================
            THEME TOGGLE
        =================================================== */}

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>


        {/* ===================================================
            LOGOUT
        =================================================== */}

        <button
          className="log-btun"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={18} />
        </button>

      </div>

    </header>
  );
};

export default HeaderforStudent;
