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

const Evaluations = () => {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const [selectedInternship, setSelectedInternship] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTask, setSelectedTask] = useState("");

  const [rating, setRating] = useState(0);

  const [technical, setTechnical] = useState("");
  const [communication, setCommunication] = useState("");
  const [workEthic, setWorkEthic] = useState("");

  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const admin = JSON.parse(
    localStorage.getItem("adminProfile") || "{}"
  );

  const employerId = admin?.id;

  /* =========================================================
     LOAD INTERNSHIPS
  ========================================================= */

  useEffect(() => {
    if (!employerId) {
      setLoading(false);
      return;
    }

    const loadInternships = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `https://remote-internship-30135.onrender.com/api/internships/employer/${employerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load internships");
        }

        const data = await response.json();

        setInternships(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Internship loading error:", error);

        toast.error("Couldn't load internships.");

        setInternships([]);
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
  }, [employerId, token]);

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
        setLoading(true);

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
              (application) =>
                application.status?.toUpperCase() === "APPROVED"
            )
          : [];

        setStudents(approvedStudents);
      } catch (error) {
        console.error("Student loading error:", error);

        toast.error("Couldn't load students.");

        setStudents([]);
      } finally {
        setLoading(false);
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
        setLoading(true);

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
        console.error("Task loading error:", error);

        toast.error("Couldn't load tasks.");

        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [selectedStudent, token]);

  /* =========================================================
     LOAD EXISTING EVALUATIONS
  ========================================================= */

  useEffect(() => {
    if (!employerId) {
      setEvaluations([]);
      return;
    }

    const loadEvaluations = async () => {
      try {
        const response = await fetch(
          `https://remote-internship-30135.onrender.com/api/evaluations/employer/${employerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load evaluations");
        }

        const data = await response.json();

        setEvaluations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Evaluation loading error:", error);

        setEvaluations([]);
      }
    };

    loadEvaluations();
  }, [employerId, token]);

  /* =========================================================
     CHECK WHETHER TASK IS ALREADY EVALUATED
  ========================================================= */

  const isTaskEvaluated = (taskId) => {
    if (!taskId) return false;

    return evaluations.some((evaluation) => {
      const evaluationTaskId =
        evaluation.taskId ??
        evaluation.task?.id ??
        evaluation.task?.taskId;

      return String(evaluationTaskId) === String(taskId);
    });
  };

  /* =========================================================
     ONLY UNEVALUATED TASKS
  ========================================================= */

  const availableTasks = tasks.filter(
    (task) => !isTaskEvaluated(task.id)
  );

  /* =========================================================
     ALL TASKS EVALUATED
  ========================================================= */

  const allTasksEvaluated =
    selectedStudent &&
    tasks.length > 0 &&
    availableTasks.length === 0;

  /* =========================================================
     TASK CHANGE
  ========================================================= */

  const handleTaskChange = (e) => {
    const taskId = e.target.value;

    /*
     * Extra protection.
     * Even though evaluated tasks are removed from
     * the dropdown, don't allow them to be selected
     * programmatically.
     */
    if (taskId && isTaskEvaluated(taskId)) {
      toast.error("This task has already been evaluated.");
      return;
    }

    setSelectedTask(taskId);

    setRating(0);
    setTechnical("");
    setCommunication("");
    setWorkEthic("");
    setStrengths("");
    setImprovements("");
    setFeedback("");
  };

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

    /*
     * Final frontend duplicate check.
     */
    if (isTaskEvaluated(selectedTask)) {
      toast.error("This task has already been evaluated.");
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

    if (!strengths.trim()) {
      toast.error("Please enter strengths.");
      return;
    }

    if (!improvements.trim()) {
      toast.error("Please enter areas for improvement.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "https://remote-internship-30135.onrender.com/api/evaluations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employerId: employerId,
            internshipId: selectedInternship,
            studentId: selectedStudent,
            taskId: selectedTask,
            rating: rating,
            technical: technical,
            communication: communication,
            workEthic: workEthic,
            strengths: strengths,
            improvements: improvements,
            feedback: feedback,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 409 ||
          data?.message
            ?.toLowerCase()
            ?.includes("already")
        ) {
          toast.error("This task has already been evaluated.");
        } else {
          toast.error(
            data?.message || "Failed to submit evaluation."
          );
        }

        return;
      }

      /*
       * Add newly-created evaluation immediately.
       * This makes the task disappear from the dropdown.
       */
      setEvaluations((previous) => [
        data,
        ...previous,
      ]);

      toast.success("Evaluation submitted successfully.");

      /*
       * Clear evaluation form.
       */
      setSelectedTask("");

      setRating(0);

      setTechnical("");
      setCommunication("");
      setWorkEthic("");

      setStrengths("");
      setImprovements("");
      setFeedback("");
    } catch (error) {
      console.error(
        "Evaluation submit error:",
        error
      );

      toast.error("Failed to submit evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     CLEAR FORM
  ========================================================= */

  const handleClear = () => {
    setSelectedInternship("");
    setSelectedStudent("");
    setSelectedTask("");

    setRating(0);

    setTechnical("");
    setCommunication("");
    setWorkEthic("");

    setStrengths("");
    setImprovements("");
    setFeedback("");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <Headerfordash />

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
              Evaluate your interns and provide
              performance feedback.
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

                {/* Internship */}

                <label>
                  Select Internship
                </label>

                <select
                  value={selectedInternship}
                  onChange={(e) => {
                    setSelectedInternship(
                      e.target.value
                    );

                    setSelectedStudent("");
                    setSelectedTask("");

                    setRating(0);

                    setTechnical("");
                    setCommunication("");
                    setWorkEthic("");

                    setStrengths("");
                    setImprovements("");
                    setFeedback("");
                  }}
                >
                  <option value="">
                    Select internship
                  </option>

                  {internships.map(
                    (internship) => (
                      <option
                        key={internship.id}
                        value={internship.id}
                      >
                        {internship.title}
                      </option>
                    )
                  )}
                </select>


                {/* Student */}

                <label>
                  Select Student
                </label>

                <select
                  value={selectedStudent}
                  onChange={(e) => {
                    setSelectedStudent(
                      e.target.value
                    );

                    setSelectedTask("");

                    setRating(0);

                    setTechnical("");
                    setCommunication("");
                    setWorkEthic("");

                    setStrengths("");
                    setImprovements("");
                    setFeedback("");
                  }}
                  disabled={!selectedInternship}
                >
                  <option value="">
                    Select student
                  </option>

                  {students.map((student) => (
                    <option
                      key={
                        student.studentId ||
                        student.id
                      }
                      value={
                        student.studentId ||
                        student.id
                      }
                    >
                      {student.fullName ||
                        student.studentName ||
                        student.name ||
                        "Student"}
                    </option>
                  ))}
                </select>


                {/* Task */}

                <label>
                  Select Task
                </label>

                <select
                  value={selectedTask}
                  onChange={handleTaskChange}
                  disabled={
                    !selectedStudent ||
                    availableTasks.length === 0
                  }
                >
                  <option value="">
                    {allTasksEvaluated
                      ? "All tasks already evaluated"
                      : "Select task"}
                  </option>

                  {availableTasks.map(
                    (task) => (
                      <option
                        key={task.id}
                        value={task.id}
                      >
                        {task.title ||
                          task.taskTitle ||
                          `Task ${task.id}`}
                      </option>
                    )
                  )}
                </select>


                {/* All evaluated message */}

                {allTasksEvaluated && (
                  <div className="evaluation-complete">
                    ✓ All tasks for this student
                    have already been evaluated.
                  </div>
                )}


                {/* No tasks */}

                {selectedStudent &&
                  tasks.length === 0 && (
                    <div className="evaluation-complete">
                      No tasks are available for this
                      student.
                    </div>
                  )}


                {/* =================================================
                    PERFORMANCE RATINGS
                ================================================= */}

                <div className="three-cols">

                  <div>
                    <label>
                      Technical Performance
                    </label>

                    <select
                      value={technical}
                      onChange={(e) =>
                        setTechnical(
                          e.target.value
                        )
                      }
                      disabled={
                        !selectedTask ||
                        submitting
                      }
                    >
                      <option value="">
                        Select rating
                      </option>

                      <option value="Excellent">
                        Excellent
                      </option>

                      <option value="Good">
                        Good
                      </option>

                      <option value="Average">
                        Average
                      </option>

                      <option value="Needs Improvement">
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
                      disabled={
                        !selectedTask ||
                        submitting
                      }
                    >
                      <option value="">
                        Select rating
                      </option>

                      <option value="Excellent">
                        Excellent
                      </option>

                      <option value="Good">
                        Good
                      </option>

                      <option value="Average">
                        Average
                      </option>

                      <option value="Needs Improvement">
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
                      disabled={
                        !selectedTask ||
                        submitting
                      }
                    >
                      <option value="">
                        Select rating
                      </option>

                      <option value="Excellent">
                        Excellent
                      </option>

                      <option value="Good">
                        Good
                      </option>

                      <option value="Average">
                        Average
                      </option>

                      <option value="Needs Improvement">
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
                        onClick={() => {
                          if (
                            selectedTask &&
                            !submitting
                          ) {
                            setRating(star);
                          }
                        }}
                      >
                        ★
                      </span>
                    )
                  )}

                </div>


                {/* =================================================
                    STRENGTHS
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
                  disabled={
                    !selectedTask ||
                    submitting
                  }
                />


                {/* =================================================
                    IMPROVEMENTS
                ================================================= */}

                <label>
                  Areas for Improvement
                </label>

                <textarea
                  placeholder="Enter areas for improvement..."
                  value={improvements}
                  onChange={(e) =>
                    setImprovements(
                      e.target.value
                    )
                  }
                  disabled={
                    !selectedTask ||
                    submitting
                  }
                />


                {/* =================================================
                    FEEDBACK
                ================================================= */}

                <label>
                  Additional Feedback
                </label>

                <textarea
                  placeholder="Enter additional feedback..."
                  value={feedback}
                  onChange={(e) =>
                    setFeedback(
                      e.target.value
                    )
                  }
                  disabled={
                    !selectedTask ||
                    submitting
                  }
                />


                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div className="button-row">

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      !selectedTask ||
                      allTasksEvaluated
                    }
                  >
                    {submitting ? (
                      <>
                        <span className="button-spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit Evaluation"
                    )}
                  </button>


                  <button
                    type="button"
                    className="clear-btun"
                    onClick={handleClear}
                    disabled={submitting}
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
                    No evaluations yet.
                  </p>
                ) : (
                  evaluations.map(
                    (evaluation) => (
                      <div
                        key={evaluation.id}
                        className="dashboard-card"
                      >

                        <h4>
                          {evaluation.taskTitle ||
                            evaluation.task?.title ||
                            "Task"}
                        </h4>

                        <p>
                          <strong>
                            Student:
                          </strong>{" "}
                          {evaluation.studentName ||
                            evaluation.student?.name ||
                            "Student"}
                        </p>

                        <p>
                          <strong>
                            Rating:
                          </strong>{" "}
                          {evaluation.rating}/5
                        </p>

                        <p>
                          <strong>
                            Technical:
                          </strong>{" "}
                          {evaluation.technical}
                        </p>

                        <p>
                          <strong>
                            Communication:
                          </strong>{" "}
                          {evaluation.communication}
                        </p>

                        <p>
                          <strong>
                            Work Ethic:
                          </strong>{" "}
                          {evaluation.workEthic}
                        </p>

                        <p>
                          <strong>
                            Strengths:
                          </strong>{" "}
                          {evaluation.strengths}
                        </p>

                        <p>
                          <strong>
                            Improvements:
                          </strong>{" "}
                          {evaluation.improvements}
                        </p>

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


/* =========================================================
   SIDEBAR BUTTON
========================================================= */

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`sd-nav-button ${
        active ? "active" : ""
      }`}
      onClick={onClick}
      aria-current={
        active ? "page" : undefined
      }
    >
      <Icon size={18} />

      <span>{label}</span>
    </button>
  );
}

export default Evaluations;