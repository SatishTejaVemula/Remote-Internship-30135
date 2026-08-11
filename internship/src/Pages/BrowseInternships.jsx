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

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY = "token";
const STUDENT_PROFILE_KEY = "studentProfile";
const BROWSE_CACHE_KEY = "browseInternshipsData";

const BrowseInternships = () => {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState("");

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  const [selectedIntern, setSelectedIntern] =
    useState(null);

  const [appliedIds, setAppliedIds] = useState([]);

  const [loading, setLoading] = useState(true);

  const getStudent = () => {
    try {
      const storedStudent = localStorage.getItem(
        STUDENT_PROFILE_KEY
      );

      return storedStudent
        ? JSON.parse(storedStudent)
        : {};
    } catch (error) {
      console.error(
        "Failed to read student profile:",
        error
      );

      return {};
    }
  };

  const student = getStudent();
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

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);

    localStorage.removeItem(
      STUDENT_PROFILE_KEY
    );

    localStorage.removeItem(
      BROWSE_CACHE_KEY
    );

    localStorage.removeItem("user");
    localStorage.removeItem("student");

    navigate("/login", {
      replace: true,
    });
  };

  const getTokenExpiration = () => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return null;
    }

    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }
      const payload = JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      if (!payload.exp) {
        return null;
      }
      return payload.exp * 1000;
    } catch (error) {
      console.error(
        "Invalid JWT:",
        error
      );

      return null;
    }
  };

  const checkTokenExpiration = () => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (!token) {
      logout();
      return false;
    }

    const expirationTime =
      getTokenExpiration();

    if (!expirationTime) {
      return true;
    }
    if (Date.now() >= expirationTime) {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();

      return false;
    }

    return true;
  };

  const setupTokenExpirationTimer = () => {
    const expirationTime =
      getTokenExpiration();

    if (!expirationTime) {
      return null;
    }

    const remainingTime =
      expirationTime - Date.now();

    if (remainingTime <= 0) {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();

      return null;
    }

    const timer = setTimeout(() => {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();
    }, remainingTime);

    return timer;
  };

  const loadCachedInternships = () => {
    try {
      const cached =
        localStorage.getItem(
          BROWSE_CACHE_KEY
        );

      if (!cached) {
        return false;
      }

      const data = JSON.parse(cached);

      if (!data) {
        return false;
      }
      const currentStudent =
        getStudent();

      if (
        data.studentId &&
        currentStudent.id &&
        Number(data.studentId) !==
          Number(currentStudent.id)
      ) {
        localStorage.removeItem(
          BROWSE_CACHE_KEY
        );

        return false;
      }
      setInternships(
        Array.isArray(data.internships)
          ? data.internships
          : []
      );

      setAppliedIds(
        Array.isArray(data.appliedIds)
          ? data.appliedIds
          : []
      );

      return true;
    } catch (error) {
      console.error(
        "Failed to load cached internships:",
        error
      );

      localStorage.removeItem(
        BROWSE_CACHE_KEY
      );

      return false;
    }
  };

  const saveInternshipsToCache = (
    internshipData,
    appliedList
  ) => {
    try {
      const cacheData = {
        studentId: userId,
        internships: internshipData,
        appliedIds: appliedList,
        cachedAt: Date.now(),
      };

      localStorage.setItem(
        BROWSE_CACHE_KEY,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error(
        "Failed to cache internships:",
        error
      );
    }
  };

  const loadInternships = async () => {
    /*
     * Check JWT before API call
     */
    if (!checkTokenExpiration()) {
      return;
    }

    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const res = await fetch(
        `${API_BASE}/api/internships/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        res.status === 401 ||
        res.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }

      if (!res.ok) {
        throw new Error(
          "Failed to load internships"
        );
      }

      const data = await res.json();

      setInternships(data);

      const appliedList = [];

      for (const intern of data) {
        /*
         * Check JWT again before every request
         */
        if (!checkTokenExpiration()) {
          return;
        }

        try {
          const applicationRes =
            await fetch(
              `${API_BASE}/api/applications/check?studentId=${userId}&internshipId=${intern.id}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type":
                    "application/json",
                },
              }
            );
          if (
            applicationRes.status ===
              401 ||
            applicationRes.status ===
              403
          ) {
            toast.error(
              "Your session has expired. Please login again."
            );

            logout();

            return;
          }

          if (!applicationRes.ok) {
            console.error(
              `Failed to check application for internship ${intern.id}`
            );

            continue;
          }

          const isApplied =
            await applicationRes.json();

          if (isApplied) {
            appliedList.push(
              intern.id
            );
          }
        } catch (error) {
          console.error(
            `Error checking application for internship ${intern.id}:`,
            error
          );
        }
      }

      setAppliedIds(appliedList);

      saveInternshipsToCache(
        data,
        appliedList
      );
    } catch (error) {
      console.error(
        "Internship loading error:",
        error
      );

      toast.error(
        "Couldn't load internships. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!checkTokenExpiration()) {
      return;
    }
    const timer =
      setupTokenExpirationTimer();

    const hasCache =
      loadCachedInternships();

    if (hasCache) {
      setLoading(false);
    } else {
      loadInternships();
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);
  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          checkTokenExpiration();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  const filteredInternships =
    internships.filter((intern) =>
      intern.title
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const handleResumeUpload = (
    file
  ) => {
    if (!file) return;

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(
        "Resume must be less than 5MB"
      );

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      toast.error(
        "Only PDF or Word files allowed"
      );

      return;
    }

    setForm((prev) => ({
      ...prev,
      resume: file,
      resumeName: file.name,
    }));
  };

  const handleSubmit = async () => {
    /*
     * Check JWT before submission
     */
    if (!checkTokenExpiration()) {
      return;
    }

    if (
      !form.name ||
      !form.email ||
      !form.organization
    ) {
      toast.error(
        "Please fill all required fields."
      );

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
      toast.error(
        "Please select an internship."
      );

      return;
    }

    if (!userId) {
      toast.error(
        "Student information not found. Please login again."
      );

      logout();

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "fullName",
      form.name
    );

    formData.append(
      "email",
      form.email
    );

    formData.append(
      "role",
      form.role
    );

    formData.append(
      "university",
      form.organization
    );

    formData.append(
      "gpa",
      form.gpa || ""
    );

    formData.append(
      "userId",
      userId
    );

    formData.append(
      "internshipId",
      selectedIntern.id
    );

    if (form.resume) {
      formData.append(
        "resume",
        form.resume
      );
    }

    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );

      const res = await fetch(
        `${API_BASE}/api/applications/apply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (
        res.status === 401 ||
        res.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }

      if (!res.ok) {
        throw new Error(
          "Failed to submit application"
        );
      }

      toast.success(
        "Application submitted successfully!"
      );

      const updatedAppliedIds = [
        ...new Set([
          ...appliedIds,
          selectedIntern.id,
        ]),
      ];

      setAppliedIds(
        updatedAppliedIds
      );

      saveInternshipsToCache(
        internships,
        updatedAppliedIds
      );

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
      console.error(
        "Application submission error:",
        error
      );

      toast.error(
        "Error submitting application"
      );
    }
  };

  return (
    <>
      <div className="sd-layout">

        <aside className="sd-sidebar">

          <nav className="sd-nav">

            <NavButton
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/student-dashboard"
                )
              }
            />

            <NavButton
              active
              icon={Search}
              label="Browse Internships"
              onClick={() =>
                navigate(
                  "/browse-internships"
                )
              }
            />

            <NavButton
              icon={FileText}
              label="My Applications"
              onClick={() =>
                navigate(
                  "/myapplications"
                )
              }
            />

            <NavButton
              icon={ClipboardList}
              label="My Tasks"
              onClick={() =>
                navigate(
                  "/mytasks"
                )
              }
            />

            <NavButton
              icon={MessageSquare}
              label="Feedback"
              onClick={() =>
                navigate(
                  "/feedback"
                )
              }
            />

            <NavButton
              icon={User}
              label="Profile"
              onClick={() =>
                navigate(
                  "/student-profile"
                )
              }
            />

          </nav>

        </aside>
        <main className="sd-main browse-page">

          {/* Page heading */}

          <div className="browse-page-header">

            <h1>
              Browse Internships
            </h1>

            <p>
              Find the right internship
              opportunity for your career.
            </p>

          </div>
          <div className="browse-search-box">

            <Search size={20} />

            <input
              type="text"
              placeholder="Search internships by title..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>
          {loading ? (

            <div className="sd-loader">

              <div className="sd-spinner"></div>

              <p>
                Loading internships…
              </p>

            </div>

          ) : filteredInternships.length ===
            0 ? (

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
                          <MapPin
                            size={16}
                          />

                          {
                            intern.location
                          }
                        </span>

                        <span>
                          <Clock
                            size={16}
                          />

                          {
                            intern.duration
                          }
                        </span>

                        <span>
                          <DollarSign
                            size={16}
                          />

                          {
                            intern.stipend
                          }
                        </span>

                      </div>

                      <p>
                        {
                          intern.description
                        }
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

          {showApplyModal &&
            selectedIntern && (

              <div className="browse-modal-overlay">

                <div className="browse-modal-container">

                  <div className="browse-modal-header">

                    <h2>
                      Apply for{" "}
                      {
                        selectedIntern.title
                      }
                    </h2>

                    <button
                      className="modal-close-btn"
                      onClick={() =>
                        setShowApplyModal(
                          false
                        )
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
                        value={
                          form.name
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target
                              .value,
                          })
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        Email *
                      </label>

                      <input
                        value={
                          form.email
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            email:
                              e.target
                                .value,
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
                      value={
                        form.role
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          role: e.target
                            .value,
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
                              e.target
                                .value,
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
                          value={
                            form.gpa
                          }
                          onChange={(e) =>
                            setForm({
                              ...form,
                              gpa: e.target
                                .value,
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
                          e.target
                            .files[0];

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
                        {
                          form.resumeName
                        }
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
                      onClick={
                        handleSubmit
                      }
                    >
                      Submit Application
                    </button>

                  </div>

                </div>

              </div>

            )}

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
                      {
                        selectedIntern.title
                      }
                    </p>

                    <p>
                      <strong>
                        Company:
                      </strong>{" "}
                      {
                        selectedIntern.companyname
                      }
                    </p>

                    <p>
                      <strong>
                        Location:
                      </strong>{" "}
                      {
                        selectedIntern.location
                      }
                    </p>

                    <p>
                      <strong>
                        Duration:
                      </strong>{" "}
                      {
                        selectedIntern.duration
                      }
                    </p>

                    <p>
                      <strong>
                        Stipend:
                      </strong>{" "}
                      {
                        selectedIntern.stipend
                      }
                    </p>

                    <p>
                      <strong>
                        Description:
                      </strong>{" "}
                      {
                        selectedIntern.description
                      }
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

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      className={`sd-nav-button ${
        active ? "active" : ""
      }`}
      onClick={onClick}
      aria-current={
        active
          ? "page"
          : undefined
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