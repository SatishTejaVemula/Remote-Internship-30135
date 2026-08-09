import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeaderforStudent from "../Components/HeaderforStudent";

import "../Styles/StudentDashboard.css";
import "../Styles/MyTasks.css";

import toast from "react-hot-toast";

import {
  LayoutDashboard,
  Search,
  FileText,
  ClipboardList,
  MessageSquare,
  User,
  CheckCircle,
  Trash2,
  Upload,
  X,
} from "lucide-react";


const MyTasks = () => {
  const navigate = useNavigate();

  /* =========================================================
     STUDENT
  ========================================================= */

  const student =
    JSON.parse(localStorage.getItem("studentProfile")) || {};


  /* =========================================================
     STATE
  ========================================================= */

  const [tasks, setTasks] = useState([]);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [description, setDescription] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteTaskId, setDeleteTaskId] =
    useState(null);


  /* =========================================================
     LOAD TASKS
  ========================================================= */

  useEffect(() => {
    if (!student?.id) {
      setLoading(false);
      return;
    }

    const loadTasks = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `https://remote-internship-30135.onrender.com/api/tasks/student/${student.id}`
        );

        if (!res.ok) {
          throw new Error(
            "Failed to load tasks"
          );
        }

        const data = await res.json();

        setTasks(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {
        console.error(
          "Tasks error:",
          error
        );

        setTasks([]);

        toast.error(
          "Couldn't load your tasks."
        );

      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [student?.id]);


  /* =========================================================
     TASK FILTERS
  ========================================================= */

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status?.toUpperCase() ===
        "COMPLETED"
    );


  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status?.toUpperCase() !==
        "COMPLETED"
    );


  /* =========================================================
     COMPLETION PERCENTAGE
  ========================================================= */

  const completionPercentage =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks.length /
            tasks.length) *
            100
        );


  /* =========================================================
     OPEN SUBMIT MODAL
  ========================================================= */

  const openSubmitModal = (task) => {
    setSelectedTask(task);

    setDescription("");

    setSelectedFile(null);
  };


  /* =========================================================
     CLOSE SUBMIT MODAL
  ========================================================= */

  const closeSubmitModal = () => {
    setSelectedTask(null);

    setDescription("");

    setSelectedFile(null);
  };


  /* =========================================================
     FILE → BASE64
  ========================================================= */

  const convertToBase64 = (file) => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () =>
          resolve(reader.result);

        reader.onerror = reject;
      }
    );
  };


  /* =========================================================
     SUBMIT TASK
  ========================================================= */

  const handleSubmitTask = async () => {
    if (!selectedTask) {
      return;
    }


    if (!description.trim()) {
      toast("Enter Description", {
        icon: "⚠️",
      });

      return;
    }


    try {
      let fileData = null;

      let fileName = null;


      /* ---------------------------------------------
         Convert selected file
      --------------------------------------------- */

      if (selectedFile) {
        fileData =
          await convertToBase64(
            selectedFile
          );

        fileName =
          selectedFile.name;
      }


      /* ---------------------------------------------
         Submit
      --------------------------------------------- */

      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/tasks/submit/${selectedTask.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            description,
            fileName,
            fileData,
          }),
        }
      );


      if (!res.ok) {
        throw new Error(
          "Task submission failed"
        );
      }


      toast.success(
        "Task submitted successfully!"
      );


      closeSubmitModal();


      /* ---------------------------------------------
         Reload tasks
      --------------------------------------------- */

      setLoading(true);


      const taskRes =
        await fetch(
          `https://remote-internship-30135.onrender.com/api/tasks/student/${student.id}`
        );


      if (!taskRes.ok) {
        throw new Error(
          "Failed to refresh tasks"
        );
      }


      const taskData =
        await taskRes.json();


      setTasks(
        Array.isArray(taskData)
          ? taskData
          : []
      );

    } catch (error) {
      console.error(
        "Submit task error:",
        error
      );

      toast.error(
        "Something went wrong. Please try again!"
      );

    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     DELETE SUBMISSION
  ========================================================= */

  const handleDeleteSubmission = (
    taskId
  ) => {
    setDeleteTaskId(taskId);

    setShowDeleteModal(true);
  };


  /* =========================================================
     CONFIRM DELETE
  ========================================================= */

  const confirmDeleteSubmission =
    async () => {
      if (!deleteTaskId) {
        return;
      }

      try {
        const res =
          await fetch(
            `https://remote-internship-30135.onrender.com/api/tasks/${deleteTaskId}`,
            {
              method: "PUT",
            }
          );


        if (!res.ok) {
          throw new Error(
            "Failed to delete submission"
          );
        }


        setLoading(true);


        const taskRes =
          await fetch(
            `https://remote-internship-30135.onrender.com/api/tasks/student/${student.id}`
          );


        if (!taskRes.ok) {
          throw new Error(
            "Failed to refresh tasks"
          );
        }


        const data =
          await taskRes.json();


        setTasks(
          Array.isArray(data)
            ? data
            : []
        );


        toast.success(
          "Submission deleted successfully"
        );

      } catch (error) {
        console.error(
          "Delete submission error:",
          error
        );

        toast.error(
          "Failed to delete submission"
        );

      } finally {
        setLoading(false);

        setShowDeleteModal(false);

        setDeleteTaskId(null);
      }
    };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      <div className="sd-layout">


        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="sd-sidebar">

          <nav className="sd-nav">

            {/* Dashboard */}

            <NavButton
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/student-dashboard"
                )
              }
            />


            {/* Browse */}

            <NavButton
              icon={Search}
              label="Browse Internships"
              onClick={() =>
                navigate(
                  "/browse-internships"
                )
              }
            />


            {/* Applications */}

            <NavButton
              icon={FileText}
              label="My Applications"
              onClick={() =>
                navigate(
                  "/myapplications"
                )
              }
            />


            {/* Tasks */}

            <NavButton
              active
              icon={ClipboardList}
              label="My Tasks"
              onClick={() =>
                navigate("/mytasks")
              }
            />


            {/* Feedback */}

            <NavButton
              icon={MessageSquare}
              label="Feedback"
              onClick={() =>
                navigate("/feedback")
              }
            />


            {/* Profile */}

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


        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="sd-main">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="page-header">

            <h1>
              My Tasks
            </h1>

            <p>
              Track and complete your
              internship tasks.
            </p>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="sd-loader">

              <div className="sd-spinner"></div>

              <p>
                Loading your tasks…
              </p>

            </div>

          ) : (

            <>


              {/* =================================================
                  PROGRESS
              ================================================= */}

              <section className="task-progress-card">

                <h3>
                  Overall Task Completion
                </h3>


                <div className="progress-bar">

                  <div
                    className="sd-progress-fill"
                    style={{
                      width:
                        `${completionPercentage}%`,
                    }}
                  />

                </div>


                <div className="progress-percent">

                  {completionPercentage}%

                </div>

              </section>


              {/* =================================================
                  PENDING TASKS
              ================================================= */}

              {pendingTasks.length === 0 ? (

                <div className="empty-task-card">

                  <CheckCircle
                    size={32}
                    color="#22c55e"
                    style={{
                      marginBottom:
                        "10px",
                    }}
                  />

                  <p>
                    No pending tasks
                  </p>

                </div>

              ) : (

                <>

                  {pendingTasks.map(
                    (task) => (

                      <div
                        key={task.id}
                        className="task-card"
                      >

                        <h4>
                          {task.title}
                        </h4>


                        <p>
                          {task.description ||
                            task.title ||
                            "Task assigned to you."}
                        </p>


                        <button
                          className="submit-task-btn"
                          onClick={() =>
                            openSubmitModal(
                              task
                            )
                          }
                        >
                          <Upload
                            size={16}
                            style={{
                              marginRight:
                                "7px",
                              verticalAlign:
                                "middle",
                            }}
                          />

                          Submit Task

                        </button>

                      </div>

                    )
                  )}

                </>

              )}


              {/* =================================================
                  COMPLETED TASKS
              ================================================= */}

              {completedTasks.length >
                0 && (

                <>

                  {completedTasks.map(
                    (task) => (

                      <div
                        key={task.id}
                        className="completed-task"
                      >


                        {/* =====================================
                            TASK INFORMATION
                        ===================================== */}

                        <div>

                          <h3>
                            {
                              task.internshipTitle ||
                              "Internship"
                            }
                          </h3>


                          <h4>
                            {task.title}
                          </h4>


                          <p className="completed-status">

                            <CheckCircle
                              size={16}
                              style={{
                                verticalAlign:
                                  "middle",
                                marginRight:
                                  "6px",
                              }}
                            />

                            Completed

                          </p>


                          {/* Submission description */}

                          {task.submissionDescription && (

                            <p>

                              <strong>
                                Description:
                              </strong>{" "}

                              {
                                task.submissionDescription
                              }

                            </p>

                          )}


                          {task.submissionFileName && (

                            <a
                              href={`https://remote-internship-30135.onrender.com/api/tasks/file/${task.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-btn"
                            >

                              {task.submissionFileName}

                            </a>

                          )}

                        </div>


                        <div
                          style={{
                            display:
                              "flex",
                            flexDirection:
                              "column",
                            gap: "10px",
                          }}
                        >

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteSubmission(
                                task.id
                              )
                            }
                          >


                            Delete

                          </button>

                        </div>

                      </div>

                    )
                  )}

                </>

              )}

            </>

          )}

        </main>

      </div>


      {/* =====================================================
          SUBMIT TASK MODAL
      ===================================================== */}

      {selectedTask && (

        <div
          className="modal-overlay"
          onClick={closeSubmitModal}
        >

          <div
            className="modal-container"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* Modal Header */}

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: "15px",
              }}
            >

              <h3>
                Submit Task
              </h3>


              <button
                type="button"
                className="modal-close-btn"
                onClick={
                  closeSubmitModal
                }
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>


            {/* Internship */}

            <h4>
              {
                selectedTask.internshipTitle ||
                "Internship"
              }
            </h4>


            {/* Task */}

            <p>
              <strong>
                Task:
              </strong>{" "}

              {selectedTask.title}

            </p>


            {/* Description */}

            <label>
              Description *
            </label>


            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe what you completed..."
            />


            {/* File */}

            <label>
              Upload File (Optional)
            </label>


            <input
              type="file"
              onChange={(event) =>
                setSelectedFile(
                  event.target.files?.[0] ||
                    null
                )
              }
            />


            {/* Selected file */}

            {selectedFile && (

              <p className="resume-name">

                Selected:{" "}

                {selectedFile.name}

              </p>

            )}


            {/* Actions */}

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={
                  closeSubmitModal
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="submit-btn"
                onClick={
                  handleSubmitTask
                }
              >
                Submit
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {showDeleteModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowDeleteModal(false)
          }
        >

          <div
            className="modal-container"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <h3>
              Delete Submission?
            </h3>


            <p
              style={{
                marginTop: "10px",
                marginBottom:
                  "20px",
              }}
            >
              This action cannot be
              undone.
            </p>


            <div className="modal-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="delete-btn"
                onClick={
                  confirmDeleteSubmission
                }
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


/* =============================================================
   SIDEBAR NAV BUTTON
============================================================= */

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


export default MyTasks;