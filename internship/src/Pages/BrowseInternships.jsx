import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderforStudent from "../Components/HeaderforStudent";
import Loader from "../Components/Loader";
import "../Styles/BrowsePage.css";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Search,
  FileText,
  ClipboardList,
  MessageSquare,
  User,
  MapPin,
  Clock,
  DollarSign,
  X,
} from "lucide-react";

const BrowseInternships = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const student = JSON.parse(localStorage.getItem("studentProfile"));
  const userId = student?.id;
  const [form, setForm] = useState({
    name: student?.name || "",
    email: student?.email || "",
    role: "Student",
    organization: student?.university || "",
    gpa: "",
    resume: null,
    resumeName: "",
  });


  useEffect(() => {
    setLoading(true);

    fetch("http://localhost:1305/api/internships/all")
      .then((res) => res.json())
      .then(async (data) => {
        setInternships(data);
        const appliedList = [];
        for (let intern of data) {
          const res = await fetch(
            `http://localhost:1305/api/applications/check?studentId=${userId}&internshipId=${intern.id}`
          );
          const isApplied = await res.json();
          if (isApplied) appliedList.push(intern.id);
        }
        setAppliedIds(appliedList);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);
  const filteredInternships = internships.filter((intern) =>
    intern.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({
      ...form,
      resume: file,
      resumeName: file.name,
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.organization) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (form.role === "Employee" && !form.resume) {
     toast.error("Resume is required for Employees.");
      return;
    }


    const formData = new FormData();
    formData.append("fullName", form.name);
    formData.append("email", form.email);
    formData.append("role", form.role);
    formData.append("university", form.organization);
    formData.append("gpa", form.gpa || "");
    formData.append("userId", userId);
    formData.append("internshipId", selectedIntern.id);

    if (form.resume) {
      formData.append("resume", form.resume);
    }

    try {
      const res = await fetch(
        "http://localhost:1305/api/applications/apply",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed");

      toast.success("Application submitted successfully!");

      setAppliedIds([...appliedIds, selectedIntern.id]);
      setShowApplyModal(false);

      setForm({
        name: "",
        email: "",
        role: "Student",
        organization: "",
        gpa: "",
        resume: null,
        resumeName: "",
      });

    } catch (error) {
      console.error(error);
      toast.error("Error submitting application");
    }
  };
  const handleResumeUpload = (file) => {
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Resume must be less than 5MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF or Word files allowed");
      return;
    }

    setForm((prev) => ({
      ...prev,
      resume: file,
      resumeName: file.name,
    }));
  };

  return (
    <>

      <div className="admin-layout" style={{ paddingTop: "70px" }}>
        <aside className="admin-sidebar">
          <button onClick={() => navigate("/student-dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <button className="active">
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

          <button onClick={() => navigate("/student-profile")}>
            <User size={18} /> Profile
          </button>
        </aside>

        <main className="admin-main browse-page">
          <div className="page-header">
            <h1>Browse Internships</h1>
          </div>

          <div className="browse-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <Loader />
          ) : (
            filteredInternships.map((intern) => (
              <div key={intern.id} className="browse-card">
                <div>
                  <h3>{intern.title}</h3>
                  <div className="browse-meta">
                    <span><MapPin size={16} /> {intern.location}</span>
                    <span><Clock size={16} /> {intern.duration}</span>
                    <span><DollarSign size={16} /> {intern.stipend}</span>
                  </div>
                  <p>{intern.description}</p>
                </div>

                <div className="browse-actions">
                  {appliedIds.includes(intern.id) ? (
                    <button className="apply-btn" style={{ background: "green" }} disabled>
                      Applied
                    </button>
                  ) : (
                    <button
                      className="apply-btn"
                      onClick={() => {
                        setSelectedIntern(intern);
                        setShowApplyModal(true);
                      }}
                    >
                      Apply Now
                    </button>
                  )}

                  <button
                    className="view-btun"
                    onClick={() => {
                      setSelectedIntern(intern);
                      setShowDetailsModal(true);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
          {showApplyModal && selectedIntern && (
            <div className="browse-modal-overlay">
              <div className="browse-modal-container">

                <div className="browse-modal-header">
                  <h2>Apply for {selectedIntern.title}</h2>
                  <X size={20} onClick={() => setShowApplyModal(false)} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Role *</label>

                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  >
                    <option value="Student">Student</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Organization *</label>

                    <input
                      value={form.organization}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          organization: e.target.value,
                        })
                      }
                    />
                  </div>

                  {form.role === "Student" && (
                    <div className="form-group">
                      <label>CGPA/Percentage</label>

                      <input
                        value={form.gpa}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            gpa: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                <label>Upload Resume*</label>
                <div className="resume-upload-box"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      handleResumeUpload(file);
                    }
                  }}
                  onClick={() => document.getElementById("resumeInput").click()}
                >
                  <p className="upload-text">
                    Drag & Drop Resume or Click to Upload
                  </p>
                  <input
                    id="resumeInput"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleResumeUpload(file);
                    }}
                  />
                  <button
                    className="choose-file-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("resumeInput").click();
                    }}
                  >
                    Choose File
                  </button>
                  {form.resumeName && (
                    <p className="uploaded-file">
                      📄 {form.resumeName}
                    </p>
                  )}
                </div>
                <div className="browse-modal-actions">
                  <button
                    className="cancel-btun"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="submit-btn"
                    onClick={handleSubmit}
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDetailsModal && selectedIntern && (
            <div className="browse-modal-overlay">
              <div className="browse-modal-container">
                <div className="browse-modal-header">
                  <h2>Internship Details</h2>
                  <X size={20} onClick={() => setShowDetailsModal(false)} />
                </div>

                <p><strong>Title:</strong> {selectedIntern.title}</p>
                <p><strong>Company:</strong> {selectedIntern.companyname}</p>
                <p><strong>Location:</strong> {selectedIntern.location}</p>
                <p><strong>Duration:</strong> {selectedIntern.duration}</p>
                <p><strong>Stipend:</strong> {selectedIntern.stipend}</p>
                <p><strong>Description:</strong> {selectedIntern.description}</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default BrowseInternships;