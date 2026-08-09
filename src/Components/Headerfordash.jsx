import React, { useEffect, useState } from "react";
import {
  LogOut,
  GraduationCap,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Styles/HeaderforAdmin.css";

const Headerfordash = () => {
  const navigate = useNavigate();

  /* =========================================================
     ADMIN FROM LOCAL STORAGE
  ========================================================= */

  const storedAdmin =
    JSON.parse(
      localStorage.getItem("adminProfile")
    ) || {};

  const [admin, setAdmin] =
    useState(storedAdmin);

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


  /* =========================================================
     APPLY THEME
  ========================================================= */

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
     LOAD ADMIN PROFILE
  ========================================================= */

  useEffect(() => {
    if (!storedAdmin?.id) return;

    const cached =
      localStorage.getItem(
        "adminProfileFull"
      );

    if (cached) {
      try {
        const parsed =
          JSON.parse(cached);

        setAdmin(parsed);
        setImgLoading(false);
      } catch (error) {
        console.error(
          "Invalid cached admin profile:",
          error
        );
      }
    }

    const token =
      localStorage.getItem("token");

    fetch(
      `https://remote-internship-30135.onrender.com/api/employers/${storedAdmin.id}`,
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
            "Failed to fetch admin profile"
          );
        }

        return res.json();
      })
      .then((data) => {
        setAdmin(data);

        localStorage.setItem(
          "adminProfileFull",
          JSON.stringify(data)
        );

        setImgLoading(false);
      })
      .catch((err) => {
        console.error(
          "Admin profile error:",
          err
        );

        setImgLoading(false);
      });
  }, [storedAdmin?.id]);


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
    <header className="admin-header">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="admin-left">

        <h2
          className="admin-logo-title"
          onClick={() =>
            navigate("/admin-dashboard")
          }
        >
          <GraduationCap size={24} />

          <span>
            InternHub
          </span>
        </h2>

      </div>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="admin-right">

        {/* ===================================================
            ADMIN INFORMATION
        =================================================== */}

        <div className="admin-info">

          <a
            href="/admin-profile"
            className="headerloname"
          >
            <strong className="admin-name">
              {admin.empname ||
                "Admin"}
            </strong>
          </a>

          <div className="admin-email">
            {admin.email ||
              "admin@gmail.com"}
          </div>

        </div>


        {/* ===================================================
            PROFILE IMAGE
        =================================================== */}

        <div
          onClick={() =>
            navigate("/admin-profile")
          }
          style={{
            cursor: "pointer",
          }}
        >

          {imgLoading && (
            <div className="admin-avatar-skeleton" />
          )}

          <img
            className="admin-avatar"
            key={admin.image}
            loading="eager"
            src={
              admin?.image
                ? admin.image.startsWith(
                    "data:"
                  )
                  ? admin.image
                  : `https://remote-internship-30135.onrender.com/api/employers/image/${admin.image}`
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile"
            onLoad={() =>
              setImgLoading(false)
            }
            onError={(e) => {
              e.currentTarget.src =
                "https://cdn-icons-png.flaticon.com/512/149/149071.png";

              setImgLoading(false);
            }}
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
          className="admin-logout-btn"
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

export default Headerfordash;