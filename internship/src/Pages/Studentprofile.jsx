import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";
import "../Styles/StudentProfile.css";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Search,
  FileText,
  ClipboardList,
  MessageSquare,
  User,
} from "lucide-react";

const StudentProfile = () => {
  const navigate = useNavigate();
  const [showImagePreview, setShowImagePreview] = useState(false);
  const storedStudent = JSON.parse(localStorage.getItem("studentProfile"));
  const [profile, setProfile] = useState(storedStudent || {});
  const [editMode, setEditMode] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extraData, setExtraData] = useState({
    phone: storedStudent?.phone || "",
    skills: (() => {
      try {
        return storedStudent?.skills
          ? JSON.parse(storedStudent.skills)
          : [];
      } catch {
        return [];
      }
    })(),
    links: (() => {
      try {
        return storedStudent?.links
          ? JSON.parse(storedStudent.links)
          : [];
      } catch {
        return [];
      }
    })(),
    resume: storedStudent?.resume || "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [linkInput, setLinkInput] = useState("");

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!storedStudent?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`https://remote-internship-30135.onrender.com/api/students/${storedStudent.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

    )
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);

        setExtraData({
          phone: data.phone || "",
          skills: data.skills ? JSON.parse(data.skills) : [],
          links: data.links ? JSON.parse(data.links) : [],
          resume: data.resume || "",
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [storedStudent?.id]);
  const fields = [
    profile.name,
    profile.university,
    profile.branch,
    extraData.phone,
    extraData.resume,
  ];

  const completion =
    Math.round(
      (fields.filter(Boolean).length / fields.length) * 100
    );

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const updated = {
      name: profile.name,
      university: profile.university,
      stream: profile.stream,
      branch: profile.branch,
      joiningyear: profile.joiningyear,
      graduatedyear: profile.graduatedyear,
      phone: extraData.phone,
      skills: JSON.stringify(extraData.skills),
      links: JSON.stringify(extraData.links),
      resume: extraData.resume,
      image: profile.image,
    };

    setProfile((prev) => ({ ...prev, ...updated }));
    setEditMode(false);


    fetch(`https://remote-internship-30135.onrender.com/api/students/${profile.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updated),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem(
          "studentProfile",
          JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            university: data.university,
            stream: data.stream,
            branch: data.branch,
            joiningyear: data.joiningyear,
            graduatedyear: data.graduatedyear,
            phone: data.phone,
            skills: data.skills,
            links: data.links,
            resume: data.resume,
            image: null,
          })
        );

        toast.success("Profile updated successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update profile");
      });
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      toast("Image size should be less than 2MB", {
        icon: "⚠️",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast("Only image files allowed", {
        icon: "⚠️",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch(`https://remote-internship-30135.onrender.com/api/students/${profile.id}/uploadImage`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((res) => res.text())
      .then((fileName) => {
        setProfile({ ...profile, image: fileName });
        toast.success("Profile photo updated successfully");
      })
      .catch(() => {
        toast.error("Failed to upload image");
      });
  };
  const removeImage = () => {
    fetch(`https://remote-internship-30135.onrender.com/api/students/${profile.id}/deleteImage`, {
      headers: { Authorization: `Bearer ${token}` },
      method: "DELETE",
    })
      .then(() => {
        setProfile({ ...profile, image: "" });
        toast.success("Profile photo removed");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to remove photo");
      });
  };

  const uploadResume = () => {
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append("file", resumeFile);

    fetch(
      `https://remote-internship-30135.onrender.com/api/students/${profile.id}/uploadResume`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    )
      .then((res) => res.text())
      .then((fileName) => {
        setExtraData({ ...extraData, resume: fileName });
        toast.success("Resume uploaded successfully");
      })
      .catch(() => {
        toast.error("Failed to upload resume");
      });
  };
  const viewResume = async () => {
    try {
      const response = await fetch(
        `https://remote-internship-30135.onrender.com/api/students/resume/${extraData.resume}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load resume");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      toast.error("Unable to open resume");
    }
  };

  const deleteResume = () => {
    fetch(
      `https://remote-internship-30135.onrender.com/api/students/${profile.id}/deleteResume`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      setExtraData({ ...extraData, resume: "" });
      toast.success("Resume deleted successfully");
    })
      .catch(() => {
        toast.error("Failed to delete resume");
      });
  };
  const imageSrc =
    profile.image
      ? profile.image.startsWith("data:")
        ? profile.image
        : `https://remote-internship-30135.onrender.com/api/students/image/${profile.image}`
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <>

      <div className="admin-layout" style={{ paddingTop: "70px" }}>
        <aside className="admin-sidebar">
          <button onClick={() => navigate("/student-dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => navigate("/browse-internships")}>
            <Search size={18} /> Browse Internships
          </button>
          <button onClick={() => navigate("/myapplications")}>
            <FileText size={18} /> My Applications
          </button>
          <button onClick={() => navigate("/mytasks")}>
            <ClipboardList size={18} /> My Tasks
          </button>
          <button onClick={() => navigate("/feedback")}>
            <MessageSquare size={18} /> Feedback
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
                <div className="dashboard-card">
                  <h2>Profile Completion</h2>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${completion}%` }}
                    />
                  </div>

                  <p className="progress-text">
                    {completion}% Complete
                  </p>
                </div>
                <div>
                  <h1>{profile.name}'s Profile</h1>
                  <p style={{ color: "#6b7280" }}>
                    Manage your complete profile
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
                  <h2>{profile.name}</h2>
                  <p>{profile.email}</p>

                  {editMode && (
                    <>
                      <div className="image-dropzone">
                        <p style={{ fontSize: "13px", color: "#6b7280" }}>
                          Drag & Drop Image or Click Below
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

                </div>

                <div className="profile-details">
                  <h3>🎓 Academic Details</h3>

                  {["name", "university", "stream", "branch"].map((field) => (
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

                  <h3 style={{ marginTop: "20px" }}>📅 Timeline</h3>

                  {["joiningyear", "graduatedyear"].map((field) => (
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
                </div>
              </div>

              <div className="dashboard-card">
                <h2>Personal Information</h2>
                <p>📧 {profile.email}</p>

                {editMode ? (
                  <input
                    value={extraData.phone}
                    onChange={(e) =>
                      setExtraData({ ...extraData, phone: e.target.value })
                    }
                  />
                ) : (
                  <p>📱 {extraData.phone}</p>
                )}
              </div>

              <div className="dashboard-card">
                <h2>Resume</h2>

                {editMode && (
                  <>
                    <input
                      type="file"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                    <button onClick={uploadResume} className="primary-btn">Upload</button>
                  </>
                )}

                {extraData.resume && (
                  <div className="resume-card">
                    <p>{extraData.resume}</p>

                    <div>
                      <button
                        onClick={viewResume}
                        className="view-btn"
                      >
                        View Resume
                      </button>

                      {editMode && (
                        <button
                          className="delete-btn"
                          onClick={deleteResume}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="dashboard-card">
                <h2>Skills</h2>

                {editMode && (
                  <div className="quick-actions-row">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                    />

                    <button
                      className="secondary-btn"
                      onClick={async () => {
                        if (!skillInput.trim()) return;

                        await fetch(
                          `https://remote-internship-30135.onrender.com/api/students/${profile.id}/add-skill?skill=${skillInput}`,
                          { method: "PUT" }
                        );

                        setExtraData({
                          ...extraData,
                          skills: [...extraData.skills, skillInput],
                        });

                        setSkillInput("");
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}

                {extraData.skills.map((s, i) => (
                  <span key={i} className="skill-chip">
                    {s}
                    {editMode && (
                      <button
                        className="delete-btn"
                        style={{ marginLeft: "8px", padding: "2px 6px" }}
                        onClick={async () => {
                          await fetch(
                            `https://remote-internship-30135.onrender.com/api/students/${profile.id}/delete-skill?skill=${s}`,
                            { method: "PUT" }
                          );

                          const updatedSkills = extraData.skills.filter((_, index) => index !== i);
                          setExtraData({ ...extraData, skills: updatedSkills });
                        }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <div className="dashboard-card">
                <h2>Links</h2>

                {editMode && (
                  <div className="quick-actions-row">
                    <input
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                    />

                    <button
                      className="secondary-btn"
                      onClick={async () => {
                        if (!linkInput.trim()) return;

                        await fetch(
                          `https://remote-internship-30135.onrender.com/api/students/${profile.id}/add-link?link=${linkInput}`,
                          { method: "PUT" }
                        );

                        setExtraData({
                          ...extraData,
                          links: [...extraData.links, linkInput],
                        });

                        setLinkInput("");
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}

                {extraData.links.map((l, i) => (
                  <div key={i} className="link-item">
                    <p style={{ margin: 0 }}>{l}</p>

                    {editMode && (
                      <button
                        className="delete-btn"
                        onClick={async () => {
                          await fetch(
                            `https://remote-internship-30135.onrender.com/api/students/${profile.id}/delete-link?link=${l}`,
                            { method: "PUT" }
                          );

                          const updatedLinks = extraData.links.filter((_, index) => index !== i);
                          setExtraData({ ...extraData, links: updatedLinks });
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {showImagePreview && (
                <div
                  className="image-preview-overlay"
                  onClick={() => setShowImagePreview(false)}
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
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default StudentProfile;