import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderforStudent from "../Components/HeaderforStudent";

import "../Styles/StudentDashboard.css";
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

  const student =
    JSON.parse(localStorage.getItem("studentProfile")) || {};

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


  /* =========================================================
     LOAD INTERNSHIPS
  ========================================================= */

  useEffect(() => {
    const loadInternships = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "https://remote-internship-30135.onrender.com/api/internships/all"
        );

        if (!res.ok) {
          throw new Error("Failed to load internships");
        }

        const data = await res.json();

        setInternships(data);

        const appliedList = [];

        for (const intern of data) {
          try {
            const applicationRes = await fetch(
              `https://remote-internship-30135.onrender.com/api/applications/check?studentId=${userId}&internshipId=${intern.id}`
            );

            const isApplied = await applicationRes.json();

            if (isApplied) {
              appliedList.push(intern.id);
            }
          } catch (error) {
            console.error(
              `Error checking application for internship ${intern.id}:`,
              error
            );
          }
        }

        setAppliedIds(appliedList);
      } catch (error) {
        console.error("Internship loading error:", error);

        toast.error(
          "Couldn't load internships. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
  }, [userId]);


  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredInternships = internships.filter((intern) =>
    intern.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );


  /* =========================================================
     RESUME UPLOAD
  ========================================================= */

  const handleResumeUpload = (file) => {
    if (!file) return;

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


  /* =========================================================
     SUBMIT APPLICATION
  ========================================================= */

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.organization
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (
      form.role === "Employee" &&
      !form.resume
    ) {
      toast.error(
        "Resume is required for Employees."
      );
      return;
    }

    if (!selectedIntern) {
      toast.error("Please select an internship.");
      return;
    }

    const formData = new FormData();

    formData.append("fullName", form.name);
    formData.append("email", form.email);
    formData.append("role", form.role);
    formData.append(
      "university",
      form.organization
    );
    formData.append("gpa", form.gpa || "");
    formData.append("userId", userId);
    formData.append(
      "internshipId",
      selectedIntern.id
    );

    if (form.resume) {
      formData.append("resume", form.resume);
    }

    try {
      const res = await fetch(
        "https://remote-internship-30135.onrender.com/api/applications/apply",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to submit application"
        );
      }

      toast.success(
        "Application submitted successfully!"
      );

      setAppliedIds((prev) => [
        ...prev,
        selectedIntern.id,
      ]);

      setShowApplyModal(false);

      setForm({
        name: student?.name || "",
        email: student?.email || "",
        role: "Student",
        organization:
          student?.university || "",
        gpa: "",
        resume: null,
        resumeName: "",
      });
    } catch (error) {
      console.error(error);

      toast.error(
        "Error submitting application"
      );
    }
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      <div className="sd-layout">


        <aside className="sd-sidebar">

          <nav className="sd-nav">

            <NavButton
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate("/student-dashboard")
              }
            />


            <NavButton
              active
              icon={Search}
              label="Browse Internships"
              onClick={() =>
                navigate("/browse-internships")
              }
            />


            <NavButton
              icon={FileText}
              label="My Applications"
              onClick={() =>
                navigate("/myapplications")
              }
            />


            <NavButton
              icon={ClipboardList}
              label="My Tasks"
              onClick={() =>
                navigate("/mytasks")
              }
            />


            <NavButton
              icon={MessageSquare}
              label="Feedback"
              onClick={() =>
                navigate("/feedback")
              }
            />


            <NavButton
              icon={User}
              label="Profile"
              onClick={() =>
                navigate("/student-profile")
              }
            />

          </nav>

        </aside>


        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <main className="sd-main browse-page">

          {/* Page heading */}

          <div className="browse-page-header">

            <h1>
              Browse Internships
            </h1>

            <p>
              Find the right internship opportunity
              for your career.
            </p>

          </div>


          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="browse-search-box">

            <Search size={20} />

            <input
              type="text"
              placeholder="Search internships by title..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* =================================================
              INTERNSHIP LIST
          ================================================= */}

          {loading ? (
            <div className="sd-loader">
              <div className="sd-spinner"></div>
              <p>Loading internships…</p>
            </div>
          ) : filteredInternships.length === 0 ? (

            <section className="sd-card browse-empty">

              <Search size={40} />

              <h2>
                No internships found
              </h2>

              <p>
                {search
                  ? "Try searching with a different internship title."
                  : "There are currently no internships available."}
              </p>

            </section>

          ) : (

            <div className="browse-internship-list">

              {filteredInternships.map(
                (intern) => (

                  <div
                    key={intern.id}
                    className="browse-card"
                  >

                    {/* Internship information */}

                    <div className="browse-card-content">

                      <h3>
                        {intern.title}
                      </h3>


                      <div className="browse-meta">

                        <span>
                          <MapPin size={16} />
                          {intern.location}
                        </span>


                        <span>
                          <Clock size={16} />
                          {intern.duration}
                        </span>


                        <span>
                          <DollarSign size={16} />
                          {intern.stipend}
                        </span>

                      </div>


                      <p>
                        {intern.description}
                      </p>

                    </div>


                    {/* Actions */}

                    <div className="browse-actions">

                      {appliedIds.includes(
                        intern.id
                      ) ? (

                        <button
                          className="apply-btn applied-btn"
                          disabled
                        >
                          Applied
                        </button>

                      ) : (

                        <button
                          className="apply-btn"
                          onClick={() => {
                            setSelectedIntern(
                              intern
                            );

                            setShowApplyModal(
                              true
                            );
                          }}
                        >
                          Apply Now
                        </button>

                      )}


                      <button
                        className="view-btun"
                        onClick={() => {
                          setSelectedIntern(
                            intern
                          );

                          setShowDetailsModal(
                            true
                          );
                        }}
                      >
                        View Details
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}


          {/* =================================================
              APPLY MODAL
          ================================================= */}

          {showApplyModal &&
            selectedIntern && (

              <div className="browse-modal-overlay">

                <div className="browse-modal-container">

                  {/* Modal header */}

                  <div className="browse-modal-header">

                    <h2>
                      Apply for{" "}
                      {selectedIntern.title}
                    </h2>

                    <button
                      className="modal-close-btn"
                      onClick={() =>
                        setShowApplyModal(false)
                      }
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>

                  </div>


                  {/* Full name + email */}

                  <div className="form-row">

                    <div className="form-group">

                      <label>
                        Full Name *
                      </label>

                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value,
                          })
                        }
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Email *
                      </label>

                      <input
                        value={form.email}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            email:
                              e.target.value,
                          })
                        }
                      />

                    </div>

                  </div>


                  {/* Role */}

                  <div className="form-group">

                    <label>
                      Role *
                    </label>

                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          role: e.target.value,
                        })
                      }
                    >
                      <option value="Student">
                        Student
                      </option>

                      <option value="Employee">
                        Employee
                      </option>
                    </select>

                  </div>


                  {/* Organization + CGPA */}

                  <div className="form-row">

                    <div className="form-group">

                      <label>
                        Organization *
                      </label>

                      <input
                        value={
                          form.organization
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            organization:
                              e.target.value,
                          })
                        }
                      />

                    </div>


                    {form.role ===
                      "Student" && (

                        <div className="form-group">

                          <label>
                            CGPA/Percentage
                          </label>

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


                  {/* Resume */}

                  <label>
                    Upload Resume *
                  </label>

                  <div
                    className="resume-upload-box"

                    onDragOver={(e) =>
                      e.preventDefault()
                    }

                    onDrop={(e) => {
                      e.preventDefault();

                      const file =
                        e.dataTransfer
                          .files[0];

                      if (file) {
                        handleResumeUpload(
                          file
                        );
                      }
                    }}

                    onClick={() =>
                      document
                        .getElementById(
                          "resumeInput"
                        )
                        .click()
                    }
                  >

                    <p className="upload-text">
                      Drag & Drop Resume
                      or Click to Upload
                    </p>


                    <input
                      id="resumeInput"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{
                        display: "none",
                      }}
                      onChange={(e) => {
                        const file =
                          e.target.files[0];

                        if (file) {
                          handleResumeUpload(
                            file
                          );
                        }
                      }}
                    />


                    <button
                      className="choose-file-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        document
                          .getElementById(
                            "resumeInput"
                          )
                          .click();
                      }}
                    >
                      Choose File
                    </button>


                    {form.resumeName && (

                      <p className="uploaded-file">
                        📄{" "}
                        {form.resumeName}
                      </p>

                    )}

                  </div>


                  {/* Modal buttons */}

                  <div className="browse-modal-actions">

                    <button
                      className="cancel-btun"
                      onClick={() =>
                        setShowApplyModal(
                          false
                        )
                      }
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


          {/* =================================================
              DETAILS MODAL
          ================================================= */}

          {showDetailsModal &&
            selectedIntern && (

              <div className="browse-modal-overlay">

                <div className="browse-modal-container">

                  <div className="browse-modal-header">

                    <h2>
                      Internship Details
                    </h2>

                    <button
                      className="modal-close-btn"
                      onClick={() =>
                        setShowDetailsModal(
                          false
                        )
                      }
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>

                  </div>


                  <div className="details-content">

                    <p>
                      <strong>
                        Title:
                      </strong>{" "}
                      {selectedIntern.title}
                    </p>


                    <p>
                      <strong>
                        Company:
                      </strong>{" "}
                      {selectedIntern.companyname}
                    </p>


                    <p>
                      <strong>
                        Location:
                      </strong>{" "}
                      {selectedIntern.location}
                    </p>


                    <p>
                      <strong>
                        Duration:
                      </strong>{" "}
                      {selectedIntern.duration}
                    </p>


                    <p>
                      <strong>
                        Stipend:
                      </strong>{" "}
                      {selectedIntern.stipend}
                    </p>


                    <p>
                      <strong>
                        Description:
                      </strong>{" "}
                      {selectedIntern.description}
                    </p>

                  </div>

                </div>

              </div>

            )}

        </main>

      </div>
    </>
  );
};


/* =============================================================
   SIDEBAR NAVIGATION BUTTON
============================================================= */

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      className={`sd-nav-button ${active ? "active" : ""
        }`}
      onClick={onClick}
      aria-current={
        active ? "page" : undefined
      }
    >
      <Icon size={20} />

      <span>
        {label}
      </span>
    </button>
  );
}


export default BrowseInternships;