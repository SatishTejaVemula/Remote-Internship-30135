import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Headerfordash from "../Components/Headerfordash";
import Loader from "../Components/Loader";
import "../Styles/Evaluations.css";
import toast from "react-hot-toast";
import {
  FileText,
  Users,
  User,
  TrendingUp,
  LayoutDashboard,
  ClipboardCheck,
} from "lucide-react";

const Evaluations = () => {
  const navigate = useNavigate();

  const loggedEmployer = JSON.parse(localStorage.getItem("adminProfile"));
  const employerId = loggedEmployer?.id;

  const [loading, setLoading] = useState(false);
  const [evaluatedTasks, setEvaluatedTasks] = useState([]);
  const [recentEvaluations, setRecentEvaluations] = useState([]);

  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState("");

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");

  const [rating, setRating] = useState(0);
  const [technical, setTechnical] = useState("");
  const [communication, setCommunication] = useState("");
  const [workEthic, setWorkEthic] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://remote-internship-30135.onrender.com/api/internships/employer/${employerId}`
        );
        const data = await res.json();
        setInternships(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    if (employerId) fetchInternships();
  }, [employerId]);

  const handleInternshipChange = async (id) => {
    setSelectedInternship(id);

    setStudents([]);
    setTasks([]);
    setSelectedStudent("");
    setSelectedTask("");
    setRecentEvaluations([]);

    if (!id) return;

    setLoading(true);

    try {
      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/applications/internship/${id}`
      );
      const data = await res.json();

      const approved = data.filter(
        (app) => app.status === "APPROVED"
      );

      setStudents(approved);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleStudentChange = async (studentId) => {
    setSelectedStudent(studentId);

    setTasks([]);
    setSelectedTask("");
    setRecentEvaluations([]);

    if (!studentId || !selectedInternship) return;

    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/tasks/student/${studentId}/internship/${selectedInternship}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      const safeTasks = Array.isArray(data) ? data : [];
      setTasks(safeTasks);

      const evalRes = await fetch(
        `https://remote-internship-30135.onrender.com/api/evaluations/student/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const evalData = await evalRes.json();


      const safeEval = Array.isArray(evalData) ? evalData : [];
      setRecentEvaluations(safeEval);

      const evaluatedIds = safeEval.map(
        (e) => e.taskId ?? e.task?.id ?? e.id
      );

      setEvaluatedTasks(evaluatedIds);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleClear = () => {
    setSelectedInternship("");
    setSelectedStudent("");
    setSelectedTask("");
    setStudents([]);
    setTasks([]);
    setRecentEvaluations([]);
    setRating(0);
    setTechnical("");
    setCommunication("");
    setWorkEthic("");
    setStrengths("");
    setImprovements("");
  };

  const handleSubmit = async () => {
    if (
      !selectedTask ||
      rating === 0 ||
      !technical ||
      !communication ||
      !workEthic
    ) {
      toast("Please fill all required fields", {
        icon: "⚠️",
      });
      return;
    }

    if (evaluatedTasks.includes(Number(selectedTask))) {
      toast("This task has already been evaluated.", {
        icon: "⚠️",
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await fetch(
        "https://remote-internship-30135.onrender.com/api/evaluations/evaluate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            studentId: selectedStudent,
            taskId: selectedTask,
            rating,
            technical,
            communication,
            workEthic,
            strengths,
            improvements,
            feedback: "Good work",
          }),
        }
      );

      toast.success("Evaluation submitted!");
      window.location.reload();
    } catch (err) {
      console.error(err);
    }

    setLoading(false);

  };

  return (
    <>
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

          <button className="active">
            <ClipboardCheck size={18} /> Evaluations
          </button>

          <button onClick={() => navigate("/admin-profile")}>
            <User size={18} /> Profile
          </button>
        </aside>

        <main className="admin-main">
          <div className="page-header">
            <h1>Evaluations</h1>
          </div>
          {loading && <Loader />}

          <div className="form-card">
            <h2>Create Evaluation</h2>

            <label>Select Internship</label>
            <select
              value={selectedInternship}
              onChange={(e) =>
                handleInternshipChange(e.target.value)
              }
            >
              <option value="">Choose internship</option>
              {internships.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>

            <label>Select Student</label>
            <select
              disabled={!selectedInternship}
              value={selectedStudent}
              onChange={(e) =>
                handleStudentChange(e.target.value)
              }
            >
              <option value="">Choose student</option>
              {students.map((s) => (
                <option key={s.id} value={s.studentId}>
                  {s.fullName}
                </option>
              ))}
            </select>

            <label>Select Task</label>
            <select
              disabled={!selectedStudent}
              value={selectedTask}
              onChange={(e) =>
                setSelectedTask(Number(e.target.value))
              }
            >
              <option value="">Choose task</option>

              {tasks
                .filter(
                  (t) =>
                    t.status?.toUpperCase() === "COMPLETED"
                )
                .map((t) => {
                  const isEvaluated = evaluatedTasks.includes(t.id);

                  return (
                    <option
                      key={t.id}
                      value={t.id}
                      disabled={isEvaluated}
                    >
                      {t.title}{" "}
                      {isEvaluated ? "✅ (Evaluated)" : ""}
                    </option>
                  );
                })}
            </select>
            <label>Overall Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= rating ? "star active" : "star"
                  }
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="three-cols">
              <select value={technical} onChange={(e) => setTechnical(e.target.value)}>
                <option value="">Technical Skills</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Average</option>
                <option>Poor</option>
              </select>

              <select value={communication} onChange={(e) => setCommunication(e.target.value)}>
                <option value="">Communication</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Average</option>
                <option>Poor</option>
              </select>

              <select value={workEthic} onChange={(e) => setWorkEthic(e.target.value)}>
                <option value="">Work Ethic</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Average</option>
                <option>Poor</option>
              </select>
            </div>

            <textarea
              placeholder="Strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
            />

            <textarea
              placeholder="Improvements"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
            />

            <div className="button-row">
              <button className="primary-btn" onClick={handleSubmit}>
                Submit Evaluation
              </button>

              <p className="clear-btun" onClick={handleClear}>
                Clear
              </p>
            </div>
          </div>

          <div className="recent-evaluations">
            <h3>Recent Evaluations</h3>

            {!selectedStudent ? (
              <p className="empty-text">
                Select a student to view evaluations
              </p>
            ) : recentEvaluations.length === 0 ? (
              <p>No evaluations found</p>
            ) : (
              recentEvaluations
                .slice()
                .reverse()
                .map((evalItem, index) => (
                  <div key={index} className="dashboard-card">
                    <h4>{evalItem.taskTitle || "Task"}</h4>
                    <p>⭐ Rating: {evalItem.rating}</p>
                    <p><strong>Technical:</strong> {evalItem.technical}</p>
                    <p><strong>Communication:</strong> {evalItem.communication}</p>
                    <p><strong>Work Ethic:</strong> {evalItem.workEthic}</p>
                  </div>
                ))
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Evaluations;