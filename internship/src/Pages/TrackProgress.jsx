import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";
import "../Styles/TrackProgress.css";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  ClipboardCheck,
  User,
} from "lucide-react";

const TrackProgress = () => {
  const navigate = useNavigate();

  const [approvedStudents, setApprovedStudents] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);

  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState("");

  useEffect(() => {
    loadData();
  }, [selectedInternship]);


  const loadData = () => {
    setLoading(true);

    const admin = JSON.parse(localStorage.getItem("adminProfile"));
    const employerId = admin?.id;

    fetch(`http://localhost:1305/api/applications/employer/${employerId}`)
      .then((res) => res.json())
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];

        let approved = [];

        if (selectedInternship) {
          approved = safeData.filter(
            (app) =>
              app.status === "APPROVED" &&
              app.internshipId === Number(selectedInternship)
          );
        }

        setApprovedStudents(approved);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setApprovedStudents([]);
        setLoading(false);
      });

    fetch(`http://localhost:1305/api/internships/employer/${employerId}`)
      .then((res) => res.json())
      .then((data) => {
        setInternships(Array.isArray(data) ? data : []);
      });
  };

  const loadTasks = (student) => {

    if (!student) return;

    setTaskLoading(true);

    const studentId = student.studentId;
    const internshipId = Number(selectedInternship);

    fetch(
      `http://localhost:1305/api/tasks/student/${studentId}/internship/${internshipId}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("TASKS:", data);

        const safeData = Array.isArray(data) ? data : [];
        safeData.sort((a, b) => b.id - a.id);
        setTasksData(safeData);
        setTaskLoading(false);
      })
      .catch(() => {
        setTasksData([]);
        setTaskLoading(false);
      });
  };

  const getProgress = () => {
    if (!tasksData || tasksData.length === 0) return 0;

    const total = tasksData.length;
    const completed = tasksData.filter(
      (t) => t.status.toUpperCase() === "COMPLETED"
    ).length;

    return Math.round((completed / total) * 100);
  };
  const handleAddTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!selectedStudent) {
      toast("Please select a student first.", {
        icon: "⚠️",
      });
      return;
    }
    if (!newTask.trim()) {
      toast("Please enter a Task!", {
        icon: "⚠️",
      });
      return;
    }
    try {

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:1305/api/tasks",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({

            studentId: selectedStudent.studentId,

            internshipId:
              Number(selectedInternship),

            title: newTask,

            description: newTask

          })
        }
      );

      if (!res.ok) {

        const err =
          await res.text();

        console.log(err);

        throw new Error(err);
      }

      toast.success(
        "Task Assigned Successfully"
      );

      setNewTask("");
      setSelectedFile(null);

      loadTasks(selectedStudent);

    }
    catch (err) {
      console.error(err);
      toast("Error assigning task", {
        icon: "⚠️",
      });
    }
  };

  return (
    <>
      {loading && <Loader />}

      <div>
        <aside className="admin-sidebar">
          <button onClick={() => navigate("/admin-dashboard")}>
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button onClick={() => navigate("/post-internship")}>
            <FileText size={18} />
            Post Internship
          </button>

          <button onClick={() => navigate("/applications")}>
            <Users size={18} />
            Applications
          </button>

          <button className="active">
            <TrendingUp size={18} />
            Track Progress
          </button>

          <button onClick={() => navigate("/evaluations")}>
            <ClipboardCheck size={18} />
            Evaluations
          </button>

          <button onClick={() => navigate("/admin-profile")}>
            <User size={18} />
            Profile
          </button>
        </aside>

        <main className="admin-main">
          <div className="page-header">
            <h1>Track Progress</h1>
            <p>Select internship → then student → assign tasks</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <select
              className="internship-select"
              value={selectedInternship}
              onChange={(e) => {
                setSelectedInternship(e.target.value);
                setSelectedStudent(null);
                setTasksData([]);
              }}
            >
              <option value="">Select Internship</option>

              {internships.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.title}
                </option>
              ))}
            </select>
          </div>

          {!selectedInternship && (
            <p style={{ color: "#6b7280" }}>
              Please select an internship to view students
            </p>
          )}

          {selectedInternship && (
            <div className="stats-grid-tp">
              {approvedStudents.length === 0 ? (
                <p>No approved students for this internship</p>
              ) : (
                approvedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="stat-card"
                    style={{
                      cursor: "pointer",
                      border:
                        selectedStudent?.id === student.id
                          ? "2px solid blue"
                          : "1px solid #ddd",
                    }}
                    onClick={() => {
                      if (selectedStudent?.id === student.id) {
                        setSelectedStudent(null);
                        setTasksData([]);
                      } else {
                        setSelectedStudent(student);
                        loadTasks(student);
                      }
                    }}
                  >
                    <h3>{student.fullName}</h3>
                    <p>
                      {selectedStudent?.id === student.id
                        ? `${getProgress()}% Completed`
                        : "Click to view progress"}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
          {selectedStudent && (
            <div className="progress-card" style={{ marginTop: "30px" }}>
              <h3>{selectedStudent.fullName}</h3>
              <p>{selectedStudent.internship?.title}</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${getProgress()}%`,
                  }}
                ></div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <input
                  className="task-input"
                  type="text"
                  placeholder="Enter new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />


                <br />

                <div className="file-dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) setSelectedFile(file);
                  }}
                >
                  <p style={{ fontSize: "13px", color: "#6b7280" }}>
                    Drag & Drop File or Click Below
                  </p>

                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />

                  {selectedFile && (
                    <p style={{ marginTop: "10px" }}>
                      {selectedFile.name}
                    </p>
                  )}
                </div>

                <button
                  className="assign-btn"
                  onClick={handleAddTask}
                >
                  Assign Task
                </button>
              </div>

              {taskLoading ? (
                <Loader />
              ) : tasksData.length === 0 ? (
                <p style={{ marginTop: "20px" }}>No tasks assigned yet</p>
              ) : (
                tasksData.map((task) => (
                  <div key={task.id} className="dashboard-card">
                    <h4>{task.title}</h4>
                    <p>Status: {task.status}</p>

                    {task.status?.toUpperCase() === "COMPLETED" && (
                      <div className="task-section">

                        {/* DESCRIPTION */}
                        {task.submissionDescription && (
                          <p>
                            <strong>Student Description:</strong>{" "}
                            {task.submissionDescription}
                          </p>
                        )}

                        {task.submissionFileName && (
                          <a
                            href={`http://localhost:1305/api/tasks/file/${task.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "blue" }}
                          >
                            View Uploaded File ({task.submissionFileName})
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main >
      </div >
    </>
  );
};

export default TrackProgress;