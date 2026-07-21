import React, { useEffect, useState } from "react";
import { LogOut, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Styles/HeaderforAdmin.css";

const HeaderforDash = () => {
  const navigate = useNavigate();

  const storedAdmin =
    JSON.parse(localStorage.getItem("adminProfile")) || {};

  const [admin, setAdmin] = useState(storedAdmin);
  const [imgLoading, setImgLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!storedAdmin?.id) return;

    const cached = localStorage.getItem("adminProfileFull");

    if (cached) {
      const parsed = JSON.parse(cached);
      setAdmin(parsed);
      setImgLoading(false);
    }
    fetch(`http://localhost:1305/api/employers/${storedAdmin.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setAdmin(data);
        localStorage.setItem("adminProfileFull", JSON.stringify(data));
        setImgLoading(false);
      })
      .catch((err) => console.error(err));
  }, [storedAdmin?.id]);

  const handleLogout = () => {
    localStorage.removeItem("adminProfile");
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="admin-header">
      <div className="admin-left">
        <div className="admin-logo-box">
          <GraduationCap size={18} />
        </div>
        <h2 className="admin-title">
          InternHub Admin
        </h2>
      </div>

      <div className="admin-right">
        <div className="admin-info">
          <a href="/admin-profile" className="headerloname">
            <strong className="admin-name">
              {admin.empname || "Admin"}
            </strong>
          </a>

          <div className="admin-email">
            {admin.email || "admin@gmail.com"}
          </div>
        </div>

        <div
          onClick={() => navigate("/admin-profile")}
          style={{ cursor: "pointer" }}
        >
          {imgLoading && (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#e5e7eb",
              }}
            />
          )}

          <img className="admin-avatar"
            key={admin.image}
            loading="eager"
            src={
              admin?.image
                ? admin.image.startsWith("data:")
                  ? admin.image
                  : `http://localhost:1305/api/employers/image/${admin.image}`
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile"
            onLoad={() => setImgLoading(false)}
            onError={(e) => {
              e.target.src =
                "https://cdn-icons-png.flaticon.com/512/149/149071.png";
              setImgLoading(false);
            }}
          />
        </div>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default HeaderforDash;