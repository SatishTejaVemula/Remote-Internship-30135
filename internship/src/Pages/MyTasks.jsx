import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderforStudent from "../Components/HeaderforStudent";
import Loader from "../Components/Loader";
import "../Styles/MyTasks.css";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Search,
  FileText,
  ClipboardList,
  MessageSquare,
  User,
} from "lucide-react";

const MyTasks = () => {
  const navigate = useNavigate();

  const student =
    JSON.parse(localStorage.getItem("studentProfile")) || {};

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  useEffect(() => {
    if (!student.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`http://localhost:1305/api/tasks/student/${student.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
  const pendingTasks = tasks.filter((t) => t.status !== "COMPLETED");

  const completionPercentage =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks.length / tasks.length) * 100);

  const openSubmitModal = (task) => {
    setSelectedTask(task);
    setDescription("");
    setSelectedFile(null);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleSubmitTask = async () => {
    if (!selectedTask) return;

    if (!description.trim()) {
      toast("Enter Description", {
        icon: "⚠️",
      });
      return;
    }

    try {
      let fileData = null;
      let fileName = null;

      if (selectedFile) {
        fileData = await convertToBase64(selectedFile);
        fileName = selectedFile.name;
      }

      await fetch(
        `http://localhost:1305/api/tasks/submit/${selectedTask.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            fileName,
            fileData,
          }),
        }
      );

      toast.success("Task submitted successfully!");
      setSelectedTask(null);

      setLoading(true);
      fetch(`http://localhost:1305/api/tasks/student/${student.id}`)
        .then((res) => res.json())
        .then((data) => {
          setTasks(data);
          setLoading(false);
        });

    } catch (error) {
      toast.error("Something went wrong. Please try again!");
      setLoading(false);
    }
  };
  const handleDeleteSubmission = (taskId) => {
    setDeleteTaskId(taskId);
    setShowDeleteModal(true);
  };
  const confirmDeleteSubmission = async () => {
    try {
      await fetch(
        `http://localhost:1305/api/tasks/${deleteTaskId}`,
        {
          method: "PUT",
        }
      );

      setLoading(true);

      const res = await fetch(
        `http://localhost:1305/api/tasks/student/${student.id}`
      );

      const data = await res.json();

      setTasks(data);
      setLoading(false);

      toast.success("Submission deleted successfully");
    } catch (err) {
      toast.error("Failed to delete submission");
    }

    setShowDeleteModal(false);
    setDeleteTaskId(null);
  };

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

          <button className="active">
            <ClipboardList size={18} /> My Tasks
          </button>

          <button onClick={() => navigate("/feedback")}>
            <MessageSquare size={18} /> Feedback
          </button>

          <button onClick={() => navigate("/student-profile")}>
            <User size={18} /> Profile
          </button>
        </aside>

        <main className="admin-main">
          <div className="page-header">
            <h1>My Tasks</h1>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              {/* PROGRESS */}
              <div className="task-progress-card">
                <h3>Overall Task Completion</h3>
                <div className="progress-bar" style={{ margin: "10px 0" }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <strong>{completionPercentage}%</strong>
              </div>

              {/* PENDING TASKS */}
              {pendingTasks.length === 0 ? (
                <div className="empty-task-card">
                  <p>No pending tasks</p>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <h4>{task.title}</h4>
                    <p style={{ color: "#6b7280" }}>{task.title}</p>

                    <button
                      className="submit-task-btn"
                      onClick={() => openSubmitModal(task)}
                    >
                      Submit Task
                    </button>
                  </div>
                ))
              )}

              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="completed-task"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3>{task.internshipTitle}</h3>
                    <h4>{task.title}</h4>

                    <p className="completed-status">
                      ✅ Completed
                    </p>

                    <p>
                      <strong>Description:</strong> {task.submissionDescription}
                    </p>

                    {task.submissionFileName && (
                      <a
                        href={`http://localhost:1305/api/tasks/file/${task.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-btn"
                      >
                        {task.submissionFileName}
                      </a>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteSubmission(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </main>
      </div>

      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-container">

            <h3>Submit Task</h3>
            <h4>{selectedTask.internshipTitle}</h4>
            <p><strong>Task:</strong> {selectedTask.title}</p>

            <label>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label>Upload File (Optional)</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />

            {selectedFile && (
              <p className="resume-name">
                Selected: {selectedFile.name}
              </p>
            )}

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setSelectedTask(null)}
              >
                Cancel
              </button>

              <button
                className="submit-btn"
                onClick={handleSubmitTask}
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>Delete Submission?</h3>

            <p style={{ marginTop: "10px", marginBottom: "20px" }}>
              This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="delete-btn"
                onClick={confirmDeleteSubmission}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyTasks;