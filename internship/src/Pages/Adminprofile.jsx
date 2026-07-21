import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";
import "../Styles/AdminProfile.css";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  ClipboardCheck,
  User,
} from "lucide-react";

const AdminProfile = () => {
  const navigate = useNavigate();

  const storedAdmin = JSON.parse(localStorage.getItem("adminProfile"));
  const token = localStorage.getItem("token");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [profile, setProfile] = useState(storedAdmin || {});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleInput, setRoleInput] = useState("");
  const [extraData, setExtraData] = useState({
    industry: storedAdmin?.industry || "",
    companySize: storedAdmin?.companySize || "",
    description: storedAdmin?.description || "",
    hiringRoles: (() => {
      try {
        return storedAdmin?.hiringRoles
          ? JSON.parse(storedAdmin.hiringRoles)
          : [];
      } catch {
        return [];
      }
    })(),
  });
  useEffect(() => {
    if (!storedAdmin?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`http://localhost:1305/api/employers/${storedAdmin.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);

        setExtraData({
          industry: data.industry || "",
          companySize: data.companySize || "",
          description: data.description || "",
          hiringRoles: data.hiringRoles
            ? JSON.parse(data.hiringRoles)
            : [],
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [storedAdmin?.id]);
  const fields = [
    profile.companyname,
    profile.empname,
    profile.location,
    profile.website,
    profile.phonenumber,
    extraData.industry,
    extraData.companySize,
    extraData.description,
  ];

  const completion = Math.round(
    (fields.filter(Boolean).length / fields.length) * 100
  );

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handleSave = () => {
    const updated = {
      companyname: profile.companyname,
      empname: profile.empname,
      email: profile.email,
      location: profile.location,
      website: profile.website,
      phonenumber: profile.phonenumber,
      industry: extraData.industry,
      companySize: extraData.companySize,
      description: extraData.description,
      hiringRoles: JSON.stringify(extraData.hiringRoles),
      image: profile.image,
    };

    setProfile((prev) => ({ ...prev, ...updated }));
    setEditMode(false);

    fetch(`http://localhost:1305/api/employers/${profile.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(updated),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("adminProfile", JSON.stringify(data));
      })
      .catch((err) => console.error(err));
  };
  const imageSrc =
    profile.image
      ? profile.image.startsWith("data:")
        ? profile.image
        : `http://localhost:1305/api/employers/image/${profile.image}`
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Image size should be less than 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    fetch(`http://localhost:1305/api/employers/${profile.id}/uploadImage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    })
      .then((res) => res.text())
      .then((fileName) => {
        setProfile((prev) => ({ ...prev, image: fileName }));
      });
  };

  const removeImage = () => {
    fetch(`http://localhost:1305/api/employers/${profile.id}/deleteImage`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        setProfile((prev) => ({ ...prev, image: "" }));
      })
      .catch((err) => console.error(err));
  };

  return (

    <div>
      <aside className="admin-sidebar">
        <button onClick={() => navigate("/admin-dashboard")}>
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button onClick={() => navigate("/post-internship")}>
          <FileText size={18} /> Post Internship
        </button>
        <button onClick={() => navigate("/applications")}>
          <Users size={18} /> Applications
        </button>
        <button onClick={() => navigate("/track-progress")}>
          <TrendingUp size={18} /> Track Progress
        </button>
        <button onClick={() => navigate("/evaluations")}>
          <ClipboardCheck size={18} /> Evaluations
        </button>
        <button className="active">
          <User size={18} /> Profile
        </button>
      </aside>

      <main className="admin-main">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="profile-header">
              <div className="dashboard-card profile-completion-card">
                <h2>Profile Completion</h2>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${completion}%`,
                    }}
                  />
                </div>

                <p className="progress-text">
                  {completion}% Complete
                </p>
              </div>
              <div>
                <h1>{profile.empname}</h1>
                <h2>{profile.companyname}</h2>
                <p style={{ color: "#6b7280" }}>
                  Manage your company profile
                </p>
              </div>

              {!editMode ? (
                <button
                  className="primary-btn"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <button className="primary-btn" onClick={handleSave}>
                  Save Changes
                </button>
              )}
            </div>

            <div className="profile-container">
              <div className="profile-card">
                <img
                  src={imageSrc}
                  alt="profile"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImagePreview(true);
                  }}
                />
                <h2>{profile.empname}</h2>
                <p>{profile.email}</p>
                {editMode && (
                  <>
                    <div
                      style={{
                        border: "2px dashed #ccc",
                        padding: "15px",
                        borderRadius: "10px",
                        textAlign: "center",
                        marginTop: "10px",
                      }}
                    >
                      <p style={{ fontSize: "13px", color: "#6b7280" }}>
                        Upload Company Logo
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e)}
                      />
                    </div>

                    {profile.image && (
                      <button className="delete-btn" onClick={removeImage}>
                        Remove Photo
                      </button>
                    )}
                  </>
                )}
                <h3 style={{ marginTop: "20px" }}>📞 Contact</h3>
                <div className="profile-row">
                  <label>Phone :-</label>
                  {editMode ? (
                    <input
                      name="phonenumber"
                      value={profile.phonenumber || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <span>{profile.phonenumber}</span>
                  )}
                </div>
              </div>

              <div className="profile-details">
                <h3>🏢 Company Details</h3>

                {["empname", "companyname", "location", "website"].map((field) => (
                  <div key={field} className="profile-row">
                    <label>{field}</label>
                    {editMode ? (
                      <input
                        name={field}
                        value={profile[field] || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <span>{profile[field]}</span>
                    )}
                  </div>
                ))}

                <div className="profile-row">
                  <label>Industry</label>
                  {editMode ? (
                    <input
                      value={extraData.industry}
                      onChange={(e) =>
                        setExtraData({
                          ...extraData,
                          industry: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{extraData.industry}</span>
                  )}
                </div>

                <div className="profile-row">
                  <label>Company Size</label>
                  {editMode ? (
                    <input
                      value={extraData.companySize}
                      onChange={(e) =>
                        setExtraData({
                          ...extraData,
                          companySize: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{extraData.companySize}</span>
                  )}
                </div>


              </div>
            </div>

            <div className="dashboard-card">
              <h2>About Company</h2>

              {editMode ? (
                <textarea
                  value={extraData.description}
                  onChange={(e) =>
                    setExtraData({
                      ...extraData,
                      description: e.target.value,
                    })
                  }
                />
              ) : (
                <p>{extraData.description}</p>
              )}
            </div>

            <div className="dashboard-card">
              <h2>Hiring Focus</h2>
              {editMode && (
                <div className="quick-actions-row">
                  <input
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="Add role (e.g. Frontend)"
                  />
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      if (!roleInput.trim()) return;

                      setExtraData({
                        ...extraData,
                        hiringRoles: [
                          ...extraData.hiringRoles,
                          roleInput,
                        ],
                      });

                      setRoleInput("");
                    }}
                  >
                    Add
                  </button>
                </div>
              )}

              {extraData.hiringRoles.map((r, i) => (
                <span key={i} className="skill-chip">
                  {r}
                  {editMode && (
                    <button
                      className="delete-btn"
                      style={{ marginLeft: "8px" }}
                      onClick={() => {
                        const updated =
                          extraData.hiringRoles.filter(
                            (_, index) => index !== i
                          );
                        setExtraData({
                          ...extraData,
                          hiringRoles: updated,
                        });
                      }}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </>
        )}
        {showImagePreview && (
          <div
            onClick={() => setShowImagePreview(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.98)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999999,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowImagePreview(false);
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                fontSize: "22px",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "50%",
              }}
            >
              ✕
            </button>

            <img
              src={imageSrc}
              alt="preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProfile;