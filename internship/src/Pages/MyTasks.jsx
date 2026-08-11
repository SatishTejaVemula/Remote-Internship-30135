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
  Upload,
  X,
} from "lucide-react";

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY = "token";
const STUDENT_PROFILE_KEY = "studentProfile";
const TASKS_CACHE_KEY = "studentTasksData";

const MyTasks = () => {
  const navigate = useNavigate();

  /* =========================================================
     STUDENT
  ========================================================= */

  const getStudent = () => {
    try {
      const storedStudent =
        localStorage.getItem(STUDENT_PROFILE_KEY);

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
     LOGOUT
  ========================================================= */

  const logout = () => {
    /*
     * Remove JWT
     */
    localStorage.removeItem(
      TOKEN_KEY
    );

    /*
     * Remove student profile
     */
    localStorage.removeItem(
      STUDENT_PROFILE_KEY
    );

    /*
     * Remove task cache
     */
    localStorage.removeItem(
      TASKS_CACHE_KEY
    );

    /*
     * Remove other possible
     * authentication data
     */
    localStorage.removeItem("user");
    localStorage.removeItem("student");

    /*
     * Redirect to login
     */
    navigate("/login", {
      replace: true,
    });
  };


  /* =========================================================
     GET JWT EXPIRATION
  ========================================================= */

  const getTokenExpiration = () => {
    const token =
      localStorage.getItem(
        TOKEN_KEY
      );

    if (!token) {
      return null;
    }

    try {
      const parts =
        token.split(".");

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

      /*
       * JWT exp = seconds
       * JS Date = milliseconds
       */
      return payload.exp * 1000;
    } catch (error) {
      console.error(
        "Invalid JWT:",
        error
      );

      return null;
    }
  };


  /* =========================================================
     CHECK JWT EXPIRATION
  ========================================================= */

  const checkTokenExpiration = () => {
    const token =
      localStorage.getItem(
        TOKEN_KEY
      );

    /*
     * No token
     */
    if (!token) {
      logout();
      return false;
    }

    const expirationTime =
      getTokenExpiration();

    /*
     * If exp is not available,
     * allow request to continue.
     */
    if (!expirationTime) {
      return true;
    }

    /*
     * Token expired
     */
    if (
      Date.now() >=
      expirationTime
    ) {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();

      return false;
    }

    return true;
  };


  /* =========================================================
     JWT EXPIRATION TIMER
  ========================================================= */

  const setupTokenExpirationTimer =
    () => {
      const expirationTime =
        getTokenExpiration();

      if (!expirationTime) {
        return null;
      }

      const remainingTime =
        expirationTime -
        Date.now();

      /*
       * Already expired
       */
      if (remainingTime <= 0) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return null;
      }

      /*
       * Automatically logout when
       * JWT expires.
       */
      const timer =
        setTimeout(() => {
          toast.error(
            "Your session has expired. Please login again."
          );

          logout();
        }, remainingTime);

      return timer;
    };


  /* =========================================================
     LOAD TASKS FROM CACHE
  ========================================================= */

  const loadCachedTasks = () => {
    try {
      const cached =
        localStorage.getItem(
          TASKS_CACHE_KEY
        );

      /*
       * No cache
       */
      if (!cached) {
        return false;
      }

      const data =
        JSON.parse(cached);

      if (!data) {
        return false;
      }

      /*
       * Get current student
       */
      const currentStudent =
        getStudent();

      /*
       * Make sure cache belongs
       * to current student.
       */
      if (
        data.studentId &&
        currentStudent.id &&
        Number(data.studentId) !==
          Number(currentStudent.id)
      ) {
        localStorage.removeItem(
          TASKS_CACHE_KEY
        );

        return false;
      }

      /*
       * Restore tasks
       */
      setTasks(
        Array.isArray(data.tasks)
          ? data.tasks
          : []
      );

      return true;
    } catch (error) {
      console.error(
        "Failed to load cached tasks:",
        error
      );

      localStorage.removeItem(
        TASKS_CACHE_KEY
      );

      return false;
    }
  };


  /* =========================================================
     SAVE TASKS TO CACHE
  ========================================================= */

  const saveTasksToCache = (
    taskData
  ) => {
    try {
      const cacheData = {
        studentId:
          student?.id,

        tasks: Array.isArray(
          taskData
        )
          ? taskData
          : [],

        cachedAt: Date.now(),
      };

      localStorage.setItem(
        TASKS_CACHE_KEY,
        JSON.stringify(
          cacheData
        )
      );
    } catch (error) {
      console.error(
        "Failed to cache tasks:",
        error
      );
    }
  };


  /* =========================================================
     LOAD TASKS FROM API
  ========================================================= */

  const loadTasks = async () => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }

    if (!student?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          TOKEN_KEY
        );

      const res =
        await fetch(
          `${API_BASE}/api/tasks/student/${student.id}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      /*
       * JWT expired
       */
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
          "Failed to load tasks"
        );
      }

      const data =
        await res.json();

      const taskData =
        Array.isArray(data)
          ? data
          : [];

      /*
       * Update state
       */
      setTasks(taskData);

      /*
       * Save to localStorage
       */
      saveTasksToCache(
        taskData
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


  /* =========================================================
     INITIAL LOAD

     1. Check JWT
     2. Setup JWT timer
     3. Check cache
     4. Cache exists -> NO API
     5. No cache -> API ONCE
  ========================================================= */

  useEffect(() => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }

    /*
     * Setup automatic logout
     */
    const timer =
      setupTokenExpirationTimer();

    /*
     * First try localStorage
     */
    const hasCache =
      loadCachedTasks();

    if (hasCache) {
      /*
       * Cache exists.
       *
       * NO API REQUEST.
       */
      setLoading(false);
    } else {
      /*
       * No cache.
       *
       * Fetch once.
       */
      loadTasks();
    }

    /*
     * Cleanup timer
     */
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);


  /* =========================================================
     CHECK JWT WHEN RETURNING TO TAB

     IMPORTANT:
     This DOES NOT fetch tasks.

     It only checks JWT expiration.
  ========================================================= */

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

  const openSubmitModal = (
    task
  ) => {
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

  const convertToBase64 = (
    file
  ) => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.readAsDataURL(
          file
        );

        reader.onload = () =>
          resolve(
            reader.result
          );

        reader.onerror =
          reject;
      }
    );
  };


  /* =========================================================
     SUBMIT TASK
  ========================================================= */

  const handleSubmitTask =
    async () => {
      if (!selectedTask) {
        return;
      }

      /*
       * Check JWT
       */
      if (
        !checkTokenExpiration()
      ) {
        return;
      }

      /*
       * Validate description
       */
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

        const token =
          localStorage.getItem(
            TOKEN_KEY
          );

        const res =
          await fetch(
            `${API_BASE}/api/tasks/submit/${selectedTask.id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                description,
                fileName,
                fileData,
              }),
            }
          );

        /*
         * JWT expired
         */
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
            "Task submission failed"
          );
        }

        /*
         * Try to get updated task from
         * backend if response contains JSON.
         */
        let updatedTask = null;

        try {
          updatedTask =
            await res.json();
        } catch {
          /*
           * Backend may return empty response.
           * In that case we update the task
           * locally.
           */
        }

        /*
         * Close modal
         */
        closeSubmitModal();


        /* ---------------------------------------------
           UPDATE TASK LOCALLY
        --------------------------------------------- */

        let updatedTasks;

        if (
          updatedTask &&
          typeof updatedTask ===
            "object" &&
          updatedTask.id
        ) {
          /*
           * Backend returned updated task
           */
          updatedTasks =
            tasks.map(
              (task) =>
                task.id ===
                selectedTask.id
                  ? updatedTask
                  : task
            );
        } else {
          /*
           * Backend didn't return task.
           *
           * Update current task locally.
           */
          updatedTasks =
            tasks.map(
              (task) =>
                task.id ===
                selectedTask.id
                  ? {
                      ...task,

                      status:
                        "COMPLETED",

                      submissionDescription:
                        description,

                      submissionFileName:
                        fileName,
                    }
                  : task
            );
        }

        /*
         * Update React state
         */
        setTasks(
          updatedTasks
        );

        /*
         * Update localStorage
         */
        saveTasksToCache(
          updatedTasks
        );

        toast.success(
          "Task submitted successfully!"
        );
      } catch (error) {
        console.error(
          "Submit task error:",
          error
        );

        toast.error(
          "Something went wrong. Please try again!"
        );
      }
    };


  /* =========================================================
     DELETE SUBMISSION
  ========================================================= */

  const handleDeleteSubmission =
    (taskId) => {
      setDeleteTaskId(taskId);

      setShowDeleteModal(
        true
      );
    };


  /* =========================================================
     CONFIRM DELETE
  ========================================================= */

  const confirmDeleteSubmission =
    async () => {
      if (!deleteTaskId) {
        return;
      }

      /*
       * Check JWT
       */
      if (
        !checkTokenExpiration()
      ) {
        return;
      }

      try {
        const token =
          localStorage.getItem(
            TOKEN_KEY
          );

        const res =
          await fetch(
            `${API_BASE}/api/tasks/${deleteTaskId}`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        /*
         * JWT expired
         */
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
            "Failed to delete submission"
          );
        }

        /*
         * Try to read updated task
         */
        let updatedTask = null;

        try {
          updatedTask =
            await res.json();
        } catch {
          /*
           * Backend may return empty response.
           */
        }

        let updatedTasks;

        if (
          updatedTask &&
          typeof updatedTask ===
            "object" &&
          updatedTask.id
        ) {
          /*
           * Backend returned updated task
           */
          updatedTasks =
            tasks.map(
              (task) =>
                task.id ===
                deleteTaskId
                  ? updatedTask
                  : task
            );
        } else {
          /*
           * Locally reset submission
           */
          updatedTasks =
            tasks.map(
              (task) =>
                task.id ===
                deleteTaskId
                  ? {
                      ...task,

                      status:
                        "PENDING",

                      submissionDescription:
                        null,

                      submissionFileName:
                        null,

                      submissionFileData:
                        null,
                    }
                  : task
            );
        }

        /*
         * Update React state
         */
        setTasks(
          updatedTasks
        );

        /*
         * Update localStorage
         */
        saveTasksToCache(
          updatedTasks
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
        setShowDeleteModal(
          false
        );

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
                navigate(
                  "/mytasks"
                )
              }
            />


            {/* Feedback */}

            <NavButton
              icon={MessageSquare}
              label="Feedback"
              onClick={() =>
                navigate(
                  "/feedback"
                )
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

              {pendingTasks.length ===
              0 ? (

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
                          {
                            task.description ||
                            task.title ||
                            "Task assigned to you."
                          }
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


                          {/* Submission file */}

                          {task.submissionFileName && (

                            <a
                              href={`${API_BASE}/api/tasks/file/${task.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-btn"
                            >

                              {
                                task.submissionFileName
                              }

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
          onClick={
            closeSubmitModal
          }
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
              value={
                description
              }
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
                  event.target
                    .files?.[0] ||
                    null
                )
              }
            />


            {/* Selected file */}

            {selectedFile && (

              <p className="resume-name">

                Selected:{" "}

                {
                  selectedFile.name
                }

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
            setShowDeleteModal(
              false
            )
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
                marginTop:
                  "10px",
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