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

const NavButton = ({ active, icon: Icon, label, onClick }) => {
  return (
    <button
      type="button"
      className={`sd-nav-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

const AdminProfile = () => {
  const navigate = useNavigate();

  const storedAdmin =
    JSON.parse(localStorage.getItem("adminProfile")) || {};

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

  /* =========================
     LOAD ADMIN PROFILE
  ========================= */

  useEffect(() => {
    if (!storedAdmin?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(
      `https://remote-internship-30135.onrender.com/api/employers/${storedAdmin.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load profile");
        }

        return res.json();
      })
      .then((data) => {
        setProfile(data);

        let hiringRoles = [];

        try {
          hiringRoles = data.hiringRoles
            ? JSON.parse(data.hiringRoles)
            : [];
        } catch {
          hiringRoles = [];
        }

        setExtraData({
          industry: data.industry || "",
          companySize: data.companySize || "",
          description: data.description || "",
          hiringRoles,
        });

        localStorage.setItem(
          "adminProfileFull",
          JSON.stringify(data)
        );

        setLoading(false);
      })
      .catch((err) => {
        console.error("Profile loading error:", err);
        toast.error("Couldn't load your profile.");
        setLoading(false);
      });
  }, [storedAdmin?.id]);

  /* =========================
     PROFILE COMPLETION
  ========================= */

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

  /* =========================
     HANDLE PROFILE CHANGE
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     SAVE PROFILE
  ========================= */

  const handleSave = async () => {
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

      hiringRoles: JSON.stringify(
        extraData.hiringRoles
      ),

      image: profile.image,
    };

    try {
      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/employers/${profile.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updated),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();

      setProfile((prev) => ({
        ...prev,
        ...data,
      }));

      localStorage.setItem(
        "adminProfile",
        JSON.stringify(data)
      );

      localStorage.setItem(
        "adminProfileFull",
        JSON.stringify(data)
      );

      setEditMode(false);

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);

      toast.error("Failed to update profile.");
    }
  };


  const DEFAULT_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const imageSrc =
    profile?.image &&
      profile.image !== "default"
      ? profile.image.startsWith("data:")
        ? profile.image
        : `https://remote-internship-30135.onrender.com/api/employers/image/${encodeURIComponent(
          profile.image
        )}`
      : DEFAULT_IMAGE;


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/employers/${profile.id}/uploadImage`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Image upload failed");
      }

      const fileName = await res.text();

      setProfile((prev) => ({
        ...prev,
        image: fileName,
      }));

      toast.success("Company logo uploaded!");
    } catch (err) {
      console.error("Image upload error:", err);

      toast.error("Failed to upload image.");
    }
  };

  /* =========================
     REMOVE IMAGE
  ========================= */

  const removeImage = async () => {
    try {
      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/employers/${profile.id}/deleteImage`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to remove image");
      }

      setProfile((prev) => ({
        ...prev,
        image: "",
      }));

      toast.success("Company logo removed.");
    } catch (err) {
      console.error("Remove image error:", err);

      toast.error("Failed to remove image.");
    }
  };

  /* =========================
     ADD HIRING ROLE
  ========================= */

  const addRole = () => {
    const role = roleInput.trim();

    if (!role) {
      return;
    }

    if (
      extraData.hiringRoles.some(
        (item) =>
          item.toLowerCase() === role.toLowerCase()
      )
    ) {
      toast.error("Role already exists.");
      return;
    }

    setExtraData((prev) => ({
      ...prev,
      hiringRoles: [
        ...prev.hiringRoles,
        role,
      ],
    }));

    setRoleInput("");
  };

  /* =========================
     REMOVE HIRING ROLE
  ========================= */

  const removeRole = (index) => {
    setExtraData((prev) => ({
      ...prev,
      hiringRoles: prev.hiringRoles.filter(
        (_, i) => i !== index
      ),
    }));
  };

  /* =========================
     RETURN
  ========================= */

  return (
    <div className="admin-layout">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sd-sidebar">
        <nav className="sd-nav">

          <NavButton
            icon={LayoutDashboard}
            label="Dashboard"
            onClick={() => navigate("/admin-dashboard")}
          />

          <NavButton
            icon={FileText}
            label="Post Internship"
            onClick={() => navigate("/post-internship")}
          />

          <NavButton
            icon={Users}
            label="Applications"
            onClick={() => navigate("/applications")}
          />

          <NavButton
            icon={TrendingUp}
            label="Track Progress"
            onClick={() => navigate("/track-progress")}
          />

          <NavButton
            icon={ClipboardCheck}
            label="Evaluations"
            onClick={() => navigate("/evaluations")}
          />

          <NavButton
            active
            icon={User}
            label="Profile"
            onClick={() => navigate("/admin-profile")}
          />

        </nav>
      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="admin-main">

        {loading ? (
          <Loader />
        ) : (
          <>

            {/* =========================
                PROFILE HEADER
            ========================= */}

            <div className="profile-header">

              <div>
                <h1>
                  {profile.empname ||
                    "Admin"}
                </h1>

                <h2>
                  {profile.companyname ||
                    "Company"}
                </h2>

                <p>
                  Manage your company profile
                </p>
              </div>

              <div className="profile-completion-card dashboard-card">

                <h2>
                  Profile Completion
                </h2>

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

              {!editMode ? (
                <button
                  className="primary-btn"
                  onClick={() =>
                    setEditMode(true)
                  }
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  className="primary-btn"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              )}

            </div>

            {/* =========================
                PROFILE CONTAINER
            ========================= */}

            <div className="profile-container">

              {/* PROFILE CARD */}

              <div className="profile-card">

                <img
                  src={imageSrc}
                  alt="Company profile"
                  onClick={() =>
                    setShowImagePreview(true)
                  }
                />

                <h2>
                  {profile.empname ||
                    "Admin"}
                </h2>

                <p>
                  {profile.email ||
                    "admin@gmail.com"}
                </p>

                {/* IMAGE UPLOAD */}

                {editMode && (
                  <>
                    <div className="image-dropzone">

                      <p>
                        Upload Company Logo
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleImageUpload
                        }
                      />

                    </div>

                    {profile.image && (
                      <button
                        className="delete-btn"
                        onClick={removeImage}
                      >
                        Remove Photo
                      </button>
                    )}
                  </>
                )}

                {/* CONTACT */}

                <h3
                  style={{
                    marginTop: "20px",
                  }}
                >
                  📞 Contact
                </h3>

                <div className="profile-row">

                  <label>
                    Phone
                  </label>

                  {editMode ? (
                    <input
                      name="phonenumber"
                      value={
                        profile.phonenumber ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                    />
                  ) : (
                    <span>
                      {profile.phonenumber ||
                        "Not provided"}
                    </span>
                  )}

                </div>

              </div>

              {/* COMPANY DETAILS */}

              <div className="profile-details">

                <h3>
                  🏢 Company Details
                </h3>

                {[
                  "empname",
                  "companyname",
                  "location",
                  "website",
                ].map((field) => (

                  <div
                    key={field}
                    className="profile-row"
                  >

                    <label>
                      {field}
                    </label>

                    {editMode ? (
                      <input
                        name={field}
                        value={
                          profile[field] ||
                          ""
                        }
                        onChange={
                          handleChange
                        }
                      />
                    ) : (
                      <span>
                        {profile[field] ||
                          "Not provided"}
                      </span>
                    )}

                  </div>

                ))}

                {/* INDUSTRY */}

                <div className="profile-row">

                  <label>
                    Industry
                  </label>

                  {editMode ? (
                    <input
                      value={
                        extraData.industry
                      }
                      onChange={(e) =>
                        setExtraData({
                          ...extraData,
                          industry:
                            e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>
                      {extraData.industry ||
                        "Not provided"}
                    </span>
                  )}

                </div>

                {/* COMPANY SIZE */}

                <div className="profile-row">

                  <label>
                    Company Size
                  </label>

                  {editMode ? (
                    <input
                      value={
                        extraData.companySize
                      }
                      onChange={(e) =>
                        setExtraData({
                          ...extraData,
                          companySize:
                            e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>
                      {extraData.companySize ||
                        "Not provided"}
                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* =========================
                ABOUT COMPANY
            ========================= */}

            <div className="dashboard-card">

              <h2>
                About Company
              </h2>

              {editMode ? (
                <textarea
                  value={
                    extraData.description
                  }
                  onChange={(e) =>
                    setExtraData({
                      ...extraData,
                      description:
                        e.target.value,
                    })
                  }
                />
              ) : (
                <p>
                  {extraData.description ||
                    "No company description added yet."}
                </p>
              )}

            </div>

            {/* =========================
                HIRING FOCUS
            ========================= */}

            <div className="dashboard-card">

              <h2>
                Hiring Focus
              </h2>

              {editMode && (
                <div className="quick-actions-row">

                  <input
                    value={roleInput}
                    onChange={(e) =>
                      setRoleInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter"
                      ) {
                        e.preventDefault();
                        addRole();
                      }
                    }}
                    placeholder="Add role (e.g. Frontend)"
                  />

                  <button
                    className="secondary-btn"
                    onClick={addRole}
                  >
                    Add
                  </button>

                </div>
              )}

              {extraData.hiringRoles.length ===
                0 ? (
                <p>
                  No hiring roles added yet.
                </p>
              ) : (
                extraData.hiringRoles.map(
                  (role, index) => (

                    <span
                      key={index}
                      className="skill-chip"
                    >

                      {role}

                      {editMode && (
                        <button
                          className="delete-btn"
                          onClick={() =>
                            removeRole(
                              index
                            )
                          }
                          aria-label={`Remove ${role}`}
                        >
                          ×
                        </button>
                      )}

                    </span>

                  )
                )
              )}

            </div>

          </>
        )}

        {/* =========================
            IMAGE PREVIEW
        ========================= */}

        {showImagePreview && (

          <div
            className="image-preview-overlay"
            onClick={() =>
              setShowImagePreview(false)
            }
          >

            <button
              onClick={(e) => {
                e.stopPropagation();

                setShowImagePreview(
                  false
                );
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background:
                  "rgba(255,255,255,0.2)",
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
              alt="Company preview"
            />

          </div>

        )}

      </main>

    </div>
  );
};

export default AdminProfile;