import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Headerfordash from "../Components/Headerfordash";
import Loader from "../Components/Loader";
import "../Styles/Evaluations.css";
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
      className={`sd-nav-button ${active ? "active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

const Evaluations = () => {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [selectedInternship, setSelectedInternship] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTask, setSelectedTask] = useState("");

  const [technical, setTechnical] = useState("");
  const [communication, setCommunication] = useState("");
  const [workEthic, setWorkEthic] = useState("");

  const [rating, setRating] = useState(0);

  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [feedback, setFeedback] = useState("");

  const [evaluations, setEvaluations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const admin = JSON.parse(
    localStorage.getItem("adminProfile") || "{}"
  );

  const employerId = admin?.id;
  const token = localStorage.getItem("token");

  /* =========================================================
     LOAD INTERNSHIPS + EVALUATIONS
     ========================================================= */

  useEffect(() => {
    if (!employerId) {
      setLoading(false);

      toast.error("Employer session not found. Please login again.");

      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const internshipRes = await fetch(
          `https://remote-internship-30135.onrender.com/api/internships/employer/${employerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!internshipRes.ok) {
          throw new Error("Failed to load internships");
        }

        const internshipData = await internshipRes.json();

        setInternships(
          Array.isArray(internshipData)
            ? internshipData
            : []
        );

        const evaluationRes = await fetch(
          `https://remote-internship-30135.onrender.com/api/evaluations/employer/${employerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (evaluationRes.ok) {
          const evaluationData = await evaluationRes.json();

          setEvaluations(
            Array.isArray(evaluationData)
              ? evaluationData
              : []
          );
        }
      } catch (error) {
        console.error("Evaluation loading error:", error);

        toast.error("Unable to load evaluation data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employerId, navigate, token]);

  /* =========================================================
     LOAD STUDENTS
     ========================================================= */

  useEffect(() => {
    if (!selectedInternship) {
      setStudents([]);
      setSelectedStudent("");
      setTasks([]);
      setSelectedTask("");
      return;
    }

    const loadStudents = async () => {
      try {
        const response = await fetch(
          `https://remote-internship-30135.onrender.com/api/applications/internship/${selectedInternship}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load students");
        }

        const data = await response.json();

        const approvedStudents = Array.isArray(data)
          ? data.filter(
              (student) =>
                student.status?.toUpperCase() === "APPROVED"
            )
          : [];

        setStudents(approvedStudents);
      } catch (error) {
        console.error(error);
        setStudents([]);
      }
    };

    loadStudents();
  }, [selectedInternship, token]);

  /* =========================================================
     LOAD TASKS
     ========================================================= */

  useEffect(() => {
    if (!selectedStudent) {
      setTasks([]);
      setSelectedTask("");
      return;
    }

    const loadTasks = async () => {
      try {
        const response = await fetch(
          `https://remote-internship-30135.onrender.com/api/tasks/student/${selectedStudent}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        const data = await response.json();

        setTasks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setTasks([]);
      }
    };

    loadTasks();
  }, [selectedStudent, token]);

  /* =========================================================
     SUBMIT EVALUATION
     ========================================================= */

  const handleSubmit = async () => {
    if (!selectedInternship) {
      toast.error("Please select an internship.");
      return;
    }

    if (!selectedStudent) {
      toast.error("Please select a student.");
      return;
    }

    if (!selectedTask) {
      toast.error("Please select a task.");
      return;
    }

    if (!rating) {
      toast.error("Please provide a rating.");
      return;
    }

    if (!technical || !communication || !workEthic) {
      toast.error("Please complete all performance ratings.");
      return;
    }

    const selectedStudentData = students.find(
      (student) =>
        String(student.studentId || student.id) ===
        String(selectedStudent)
    );

    const selectedInternshipData = internships.find(
      (internship) =>
        String(internship.id) === String(selectedInternship)
    );

    const selectedTaskData = tasks.find(
      (task) =>
        String(task.id) === String(selectedTask)
    );

    const payload = {
      employerId: employerId,
      internshipId: selectedInternship,
      studentId: selectedStudent,

      internshipTitle:
        selectedInternshipData?.title || "",

      studentName:
        selectedStudentData?.fullName ||
        selectedStudentData?.studentName ||
        "",

      taskId: selectedTask,

      taskTitle:
        selectedTaskData?.title ||
        selectedTaskData?.taskTitle ||
        "Task",

      rating,
      technical,
      communication,
      workEthic,
      strengths,
      improvements,
      feedback,
    };

    try {
      setSubmitLoading(true);

      const response = await fetch(
        "https://remote-internship-30135.onrender.com/api/evaluations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || "Failed to create evaluation"
        );
      }

      const data = await response.json();

      setEvaluations((previous) => [
        data,
        ...previous,
      ]);

      toast.success("Evaluation created successfully!");

      handleClear();
    } catch (error) {
      console.error("Evaluation submit error:", error);

      toast.error(
        error.message || "Failed to create evaluation."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  /* =========================================================
     CLEAR FORM
     ========================================================= */

  const handleClear = () => {
    setSelectedInternship("");
    setSelectedStudent("");
    setSelectedTask("");

    setTechnical("");
    setCommunication("");
    setWorkEthic("");

    setRating(0);

    setStrengths("");
    setImprovements("");
    setFeedback("");

    setStudents([]);
    setTasks([]);
  };

  return (
    <>

      <div className="admin-layout">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className="sd-sidebar">
          <nav className="sd-nav">

            <NavButton
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate("/admin-dashboard")
              }
            />

            <NavButton
              icon={FileText}
              label="Post Internship"
              onClick={() =>
                navigate("/post-internship")
              }
            />

            <NavButton
              icon={Users}
              label="Applications"
              onClick={() =>
                navigate("/applications")
              }
            />

            <NavButton
              icon={TrendingUp}
              label="Track Progress"
              onClick={() =>
                navigate("/track-progress")
              }
            />

            {/* ACTIVE PAGE */}
            <NavButton
              active
              icon={ClipboardCheck}
              label="Evaluations"
              onClick={() =>
                navigate("/evaluations")
              }
            />

            <NavButton
              icon={User}
              label="Profile"
              onClick={() =>
                navigate("/admin-profile")
              }
            />

          </nav>
        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <main className="admin-main">

          <div className="page-header">
            <h1>Evaluations</h1>

            <p>
              Evaluate your interns and provide meaningful
              feedback on their performance.
            </p>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>

              {/* =================================================
                  EVALUATION FORM
              ================================================= */}

              <section className="form-card">

                <h2>Create Evaluation</h2>

                <label>
                  Internship
                </label>

                <select
                  value={selectedInternship}
                  onChange={(e) => {
                    setSelectedInternship(
                      e.target.value
                    );
                    setSelectedStudent("");
                    setSelectedTask("");
                  }}
                >
                  <option value="">
                    Select Internship
                  </option>

                  {internships.map((internship) => (
                    <option
                      key={internship.id}
                      value={internship.id}
                    >
                      {internship.title}
                    </option>
                  ))}
                </select>

                <label>
                  Student
                </label>

                <select
                  value={selectedStudent}
                  disabled={!selectedInternship}
                  onChange={(e) => {
                    setSelectedStudent(
                      e.target.value
                    );
                    setSelectedTask("");
                  }}
                >
                  <option value="">
                    {selectedInternship
                      ? "Select Student"
                      : "Select internship first"}
                  </option>

                  {students.map((student) => {
                    const id =
                      student.studentId ||
                      student.id;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {student.fullName ||
                          student.studentName ||
                          student.name ||
                          "Student"}
                      </option>
                    );
                  })}
                </select>

                <label>
                  Task
                </label>

                <select
                  value={selectedTask}
                  disabled={!selectedStudent}
                  onChange={(e) =>
                    setSelectedTask(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    {selectedStudent
                      ? "Select Task"
                      : "Select student first"}
                  </option>

                  {tasks.map((task) => (
                    <option
                      key={task.id}
                      value={task.id}
                    >
                      {task.title ||
                        task.taskTitle ||
                        "Task"}
                    </option>
                  ))}
                </select>

                {/* =================================================
                    THREE RATINGS
                ================================================= */}

                <div className="three-cols">

                  <div>
                    <label>
                      Technical Skills
                    </label>

                    <select
                      value={technical}
                      onChange={(e) =>
                        setTechnical(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select rating
                      </option>
                      <option>Excellent</option>
                      <option>Very Good</option>
                      <option>Good</option>
                      <option>Average</option>
                      <option>
                        Needs Improvement
                      </option>
                    </select>
                  </div>

                  <div>
                    <label>
                      Communication
                    </label>

                    <select
                      value={communication}
                      onChange={(e) =>
                        setCommunication(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select rating
                      </option>
                      <option>Excellent</option>
                      <option>Very Good</option>
                      <option>Good</option>
                      <option>Average</option>
                      <option>
                        Needs Improvement
                      </option>
                    </select>
                  </div>

                  <div>
                    <label>
                      Work Ethic
                    </label>

                    <select
                      value={workEthic}
                      onChange={(e) =>
                        setWorkEthic(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select rating
                      </option>
                      <option>Excellent</option>
                      <option>Very Good</option>
                      <option>Good</option>
                      <option>Average</option>
                      <option>
                        Needs Improvement
                      </option>
                    </select>
                  </div>

                </div>

                {/* =================================================
                    STAR RATING
                ================================================= */}

                <label>
                  Overall Rating
                </label>

                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <span
                        key={star}
                        className={`star ${
                          star <= rating
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setRating(star)
                        }
                      >
                        ★
                      </span>
                    )
                  )}
                </div>

                {/* =================================================
                    TEXT FIELDS
                ================================================= */}

                <label>
                  Strengths
                </label>

                <textarea
                  placeholder="Enter intern's strengths..."
                  value={strengths}
                  onChange={(e) =>
                    setStrengths(
                      e.target.value
                    )
                  }
                />

                <label>
                  Areas for Improvement
                </label>

                <textarea
                  placeholder="Enter areas where the intern can improve..."
                  value={improvements}
                  onChange={(e) =>
                    setImprovements(
                      e.target.value
                    )
                  }
                />

                <label>
                  Feedback
                </label>

                <textarea
                  placeholder="Write detailed feedback..."
                  value={feedback}
                  onChange={(e) =>
                    setFeedback(
                      e.target.value
                    )
                  }
                />

                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div className="button-row">

                  <button
                    className="primary-btn"
                    onClick={handleSubmit}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <span className="button-spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit Evaluation"
                    )}
                  </button>

                  <button
                    className="clear-btun"
                    onClick={handleClear}
                    disabled={submitLoading}
                  >
                    Clear
                  </button>

                </div>

              </section>

              {/* =================================================
                  RECENT EVALUATIONS
              ================================================= */}

              <section className="recent-evaluations">

                <h3>
                  Recent Evaluations
                </h3>

                {evaluations.length === 0 ? (
                  <p className="empty-text">
                    No evaluations created yet.
                  </p>
                ) : (
                  evaluations.map(
                    (evaluation) => (
                      <div
                        className="dashboard-card"
                        key={evaluation.id}
                      >

                        <h4>
                          {evaluation.internshipTitle ||
                            "Internship"}
                        </h4>

                        <p>
                          <strong>
                            Student:
                          </strong>{" "}
                          {evaluation.studentName ||
                            evaluation.fullName ||
                            "Student"}
                        </p>

                        <p>
                          <strong>
                            Task:
                          </strong>{" "}
                          {evaluation.taskTitle ||
                            "Task"}
                        </p>

                        <p>
                          <strong>
                            Rating:
                          </strong>{" "}
                          ⭐{" "}
                          {evaluation.rating || 0}/5
                        </p>

                        <p>
                          <strong>
                            Technical:
                          </strong>{" "}
                          {evaluation.technical ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Communication:
                          </strong>{" "}
                          {evaluation.communication ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Work Ethic:
                          </strong>{" "}
                          {evaluation.workEthic ||
                            "N/A"}
                        </p>

                        {evaluation.strengths && (
                          <p>
                            <strong>
                              Strengths:
                            </strong>{" "}
                            {evaluation.strengths}
                          </p>
                        )}

                        {evaluation.improvements && (
                          <p>
                            <strong>
                              Areas for Improvement:
                            </strong>{" "}
                            {evaluation.improvements}
                          </p>
                        )}

                        {evaluation.feedback && (
                          <p>
                            <strong>
                              Feedback:
                            </strong>{" "}
                            {evaluation.feedback}
                          </p>
                        )}

                      </div>
                    )
                  )
                )}

              </section>

            </>
          )}

        </main>
      </div>
    </>
  );
};

export default Evaluations;