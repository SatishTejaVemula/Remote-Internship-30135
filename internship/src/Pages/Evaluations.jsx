import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY = "token";
const ADMIN_PROFILE_KEY = "adminProfile";

const INTERNSHIPS_CACHE_KEY =
  "adminEvaluationsInternships";

const STUDENTS_CACHE_KEY =
  "adminEvaluationsStudents";

const TASKS_CACHE_KEY =
  "adminEvaluationsTasks";

const EVALUATIONS_CACHE_KEY =
  "adminEvaluationsData";

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

  /* =========================================================
     LOADING STATES
  ========================================================= */

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getAdmin = () => {
    try {
      return JSON.parse(
        localStorage.getItem(ADMIN_PROFILE_KEY) || "{}"
      );
    } catch (error) {
      console.error("Admin profile error:", error);
      return {};
    }
  };

  const admin = getAdmin();
  const employerId = admin?.id;

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_PROFILE_KEY);

    localStorage.removeItem(INTERNSHIPS_CACHE_KEY);
    localStorage.removeItem(STUDENTS_CACHE_KEY);
    localStorage.removeItem(TASKS_CACHE_KEY);
    localStorage.removeItem(EVALUATIONS_CACHE_KEY);

    localStorage.removeItem("adminDashboardData");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");

    navigate("/login", { replace: true });
  };

  /* =========================================================
     JWT EXPIRATION
  ========================================================= */

  const getTokenExpiration = () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) return null;

    try {
      const parts = token.split(".");

      if (parts.length !== 3) return null;

      const payload = JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      return payload?.exp
        ? payload.exp * 1000
        : null;
    } catch (error) {
      console.error("Invalid JWT:", error);
      return null;
    }
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      logout();
      return false;
    }

    const expirationTime = getTokenExpiration();

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
    const expirationTime = getTokenExpiration();

    if (!expirationTime) return null;

    const remainingTime = expirationTime - Date.now();

    if (remainingTime <= 0) {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();
      return null;
    }

    return setTimeout(() => {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();
    }, remainingTime);
  };

  /* =========================================================
     AUTHORIZED FETCH

     Every API request uses the current token instead of
     the token captured when the component first rendered.
  ========================================================= */

  const authorizedFetch = async (url, options = {}) => {
    if (!checkTokenExpiration()) {
      return null;
    }

    const currentToken =
      localStorage.getItem(TOKEN_KEY);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();
      return null;
    }

    return response;
  };

  /* =========================================================
     CACHE HELPERS
  ========================================================= */

  const readCache = (key, fallback = null) => {
    try {
      const value = localStorage.getItem(key);

      if (!value) return fallback;

      return JSON.parse(value);
    } catch (error) {
      console.error(`Cache read error: ${key}`, error);
      return fallback;
    }
  };

  const writeCache = (key, value) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error(`Cache write error: ${key}`, error);
    }
  };

  /* =========================================================
     INTERNSHIPS CACHE
  ========================================================= */

  const loadCachedInternships = () => {
    const cached = readCache(
      INTERNSHIPS_CACHE_KEY,
      null
    );

    if (!cached) return null;

    if (
      cached.employerId &&
      employerId &&
      Number(cached.employerId) !== Number(employerId)
    ) {
      localStorage.removeItem(
        INTERNSHIPS_CACHE_KEY
      );
      return null;
    }

    return Array.isArray(cached.internships)
      ? cached.internships
      : [];
  };

  const saveInternshipsCache = (data) => {
    writeCache(INTERNSHIPS_CACHE_KEY, {
      employerId,
      internships: Array.isArray(data) ? data : [],
      cachedAt: Date.now(),
    });
  };

  /* =========================================================
     STUDENTS CACHE

     One cache entry per internship.
  ========================================================= */

  const getStudentsCaches = () =>
    readCache(STUDENTS_CACHE_KEY, {});

  const loadCachedStudents = (internshipId) => {
    const caches = getStudentsCaches();
    const key = String(internshipId);
    const cached = caches[key];

    if (!cached) return null;

    return Array.isArray(cached.students)
      ? cached.students
      : [];
  };

  const saveStudentsCache = (
    internshipId,
    data
  ) => {
    const caches = getStudentsCaches();

    caches[String(internshipId)] = {
      employerId,
      internshipId,
      students: Array.isArray(data) ? data : [],
      cachedAt: Date.now(),
    };

    writeCache(STUDENTS_CACHE_KEY, caches);
  };

  /* =========================================================
     TASKS CACHE

     One cache entry per student.
  ========================================================= */

  const getTasksCaches = () =>
    readCache(TASKS_CACHE_KEY, {});

  const loadCachedTasks = (studentId) => {
    const caches = getTasksCaches();
    const key = String(studentId);
    const cached = caches[key];

    if (!cached) return null;

    return Array.isArray(cached.tasks)
      ? cached.tasks
      : [];
  };

  const saveTasksCache = (
    studentId,
    data
  ) => {
    const caches = getTasksCaches();

    caches[String(studentId)] = {
      studentId,
      tasks: Array.isArray(data) ? data : [],
      cachedAt: Date.now(),
    };

    writeCache(TASKS_CACHE_KEY, caches);
  };

  /* =========================================================
     EVALUATIONS CACHE
  ========================================================= */

  const loadCachedEvaluations = () => {
    const cached = readCache(
      EVALUATIONS_CACHE_KEY,
      null
    );

    if (!cached) return null;

    if (
      cached.employerId &&
      employerId &&
      Number(cached.employerId) !== Number(employerId)
    ) {
      localStorage.removeItem(
        EVALUATIONS_CACHE_KEY
      );
      return null;
    }

    return Array.isArray(cached.evaluations)
      ? cached.evaluations
      : [];
  };

  const saveEvaluationsCache = (data) => {
    writeCache(EVALUATIONS_CACHE_KEY, {
      employerId,
      evaluations: Array.isArray(data) ? data : [],
      cachedAt: Date.now(),
    });
  };

  /* =========================================================
     LOAD INTERNSHIPS

     API is called only when internships are not cached.
  ========================================================= */

  useEffect(() => {
    if (!employerId) {
      setLoading(false);
      return;
    }

    if (!checkTokenExpiration()) return;

    const timer = setupTokenExpirationTimer();

    const cachedInternships =
      loadCachedInternships();

    if (cachedInternships !== null) {
      setInternships(cachedInternships);
      setLoading(false);
    } else {
      const loadInternships = async () => {
        try {
          setLoading(true);

          const response = await authorizedFetch(
            `${API_BASE}/api/internships/employer/${employerId}`
          );

          if (!response) return;

          if (!response.ok) {
            throw new Error(
              "Failed to load internships"
            );
          }

          const data = await response.json();

          const safeData = Array.isArray(data)
            ? data
            : [];

          setInternships(safeData);
          saveInternshipsCache(safeData);
        } catch (error) {
          console.error(
            "Internship loading error:",
            error
          );

          toast.error(
            "Couldn't load internships."
          );

          setInternships([]);
        } finally {
          setLoading(false);
        }
      };

      loadInternships();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [employerId]);

  /* =========================================================
     LOAD EXISTING EVALUATIONS

     API is called only once when cache doesn't exist.
  ========================================================= */

  useEffect(() => {
    if (!employerId) {
      setEvaluations([]);
      return;
    }

    if (!checkTokenExpiration()) return;

    const cachedEvaluations =
      loadCachedEvaluations();

    if (cachedEvaluations !== null) {
      setEvaluations(cachedEvaluations);
      return;
    }

    const loadEvaluations = async () => {
      try {
        const response = await authorizedFetch(
          `${API_BASE}/api/evaluations/employer/${employerId}`
        );

        if (!response) return;

        if (!response.ok) {
          throw new Error(
            "Failed to load evaluations"
          );
        }

        const data = await response.json();

        const safeData = Array.isArray(data)
          ? data
          : [];

        setEvaluations(safeData);
        saveEvaluationsCache(safeData);
      } catch (error) {
        console.error(
          "Evaluation loading error:",
          error
        );

        setEvaluations([]);
      }
    };

    loadEvaluations();
  }, [employerId]);

  /* =========================================================
     LOAD STUDENTS

     Changing internship now checks cache first.
     It does NOT refetch if students are already cached.
  ========================================================= */

  useEffect(() => {
    if (!selectedInternship) {
      setStudents([]);
      setSelectedStudent("");
      setTasks([]);
      setSelectedTask("");
      setLoadingStudents(false);
      setLoadingTasks(false);
      return;
    }

    if (!checkTokenExpiration()) return;

    const cachedStudents =
      loadCachedStudents(selectedInternship);

    if (cachedStudents !== null) {
      setStudents(cachedStudents);
      setLoadingStudents(false);
      return;
    }

    const loadStudents = async () => {
      try {
        setLoadingStudents(true);

        const response = await authorizedFetch(
          `${API_BASE}/api/applications/internship/${selectedInternship}`
        );

        if (!response) return;

        if (!response.ok) {
          throw new Error(
            "Failed to load students"
          );
        }

        const data = await response.json();

        const approvedStudents = Array.isArray(data)
          ? data.filter(
              (application) =>
                application.status?.toUpperCase() ===
                "APPROVED"
            )
          : [];

        setStudents(approvedStudents);
        saveStudentsCache(
          selectedInternship,
          approvedStudents
        );
      } catch (error) {
        console.error(
          "Student loading error:",
          error
        );

        toast.error(
          "Couldn't load students."
        );

        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedInternship]);

  /* =========================================================
     LOAD TASKS

     Changing student now checks cache first.
  ========================================================= */

  useEffect(() => {
    if (!selectedStudent) {
      setTasks([]);
      setSelectedTask("");
      setLoadingTasks(false);
      return;
    }

    if (!checkTokenExpiration()) return;

    const cachedTasks =
      loadCachedTasks(selectedStudent);

    if (cachedTasks !== null) {
      setTasks(cachedTasks);
      setLoadingTasks(false);
      return;
    }

    const loadTasks = async () => {
      try {
        setLoadingTasks(true);

        const response = await authorizedFetch(
          `${API_BASE}/api/tasks/student/${selectedStudent}`
        );

        if (!response) return;

        if (!response.ok) {
          throw new Error(
            "Failed to load tasks"
          );
        }

        const data = await response.json();

        const safeData = Array.isArray(data)
          ? data
          : [];

        setTasks(safeData);
        saveTasksCache(
          selectedStudent,
          safeData
        );
      } catch (error) {
        console.error(
          "Task loading error:",
          error
        );

        toast.error(
          "Couldn't load tasks."
        );

        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    loadTasks();
  }, [selectedStudent]);

  /* =========================================================
     CHECK JWT WHEN RETURNING TO TAB

     IMPORTANT:
     This only checks the JWT.
     It does NOT refetch anything.
  ========================================================= */

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
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
     CHECK WHETHER TASK IS COMPLETED
  ========================================================= */

  const isTaskCompleted = (task) => {
    if (!task) return false;

    const status =
      task.status ??
      task.taskStatus ??
      task.completionStatus ??
      task.state;

    if (
      typeof status === "string" &&
      [
        "COMPLETED",
        "COMPLETE",
        "DONE",
        "FINISHED",
      ].includes(status.trim().toUpperCase())
    ) {
      return true;
    }

    if (
      task.completed === true ||
      task.isCompleted === true ||
      task.completion === true ||
      task.taskCompleted === true
    ) {
      return true;
    }

    return false;
  };

  /* =========================================================
     AVAILABLE TASKS

     ONLY SHOW:
     1. COMPLETED TASKS
     2. TASKS NOT ALREADY EVALUATED
  ========================================================= */

  const availableTasks = tasks.filter(
    (task) =>
      isTaskCompleted(task) &&
      !isTaskEvaluated(task.id)
  );

  /* =========================================================
     CHECK WHETHER STUDENT HAS INCOMPLETE TASKS
  ========================================================= */

  const hasIncompleteTasks = tasks.some(
    (task) => !isTaskCompleted(task)
  );

  /* =========================================================
     CHECK WHETHER ALL COMPLETED TASKS ARE EVALUATED
  ========================================================= */

  const completedTasks = tasks.filter((task) =>
    isTaskCompleted(task)
  );

  const allCompletedTasksEvaluated =
    selectedStudent &&
    completedTasks.length > 0 &&
    completedTasks.every((task) =>
      isTaskEvaluated(task.id)
    );

  /* =========================================================
     CHECK WHETHER THERE ARE NO COMPLETED TASKS
  ========================================================= */

  const noCompletedTasks =
    selectedStudent &&
    !loadingTasks &&
    tasks.length > 0 &&
    completedTasks.length === 0;

  /* =========================================================
     TASK CHANGE
  ========================================================= */

  const handleTaskChange = (e) => {
    const taskId = e.target.value;

    if (
      taskId &&
      isTaskEvaluated(taskId)
    ) {
      toast.error(
        "This task has already been evaluated."
      );
      return;
    }

    const selectedTaskObject = tasks.find(
      (task) =>
        String(task.id) === String(taskId)
    );

    if (
      selectedTaskObject &&
      !isTaskCompleted(selectedTaskObject)
    ) {
      toast.error(
        "This task must be completed before evaluation."
      );
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
    if (!checkTokenExpiration()) return;

    if (!selectedInternship) {
      toast.error(
        "Please select an internship."
      );
      return;
    }

    if (!selectedStudent) {
      toast.error(
        "Please select a student."
      );
      return;
    }

    if (!selectedTask) {
      toast.error(
        "Please select a task."
      );
      return;
    }

    /* =====================================================
       FINAL CHECK:
       TASK MUST BE COMPLETED
    ===================================================== */

    const selectedTaskObject = tasks.find(
      (task) =>
        String(task.id) === String(selectedTask)
    );

    if (!selectedTaskObject) {
      toast.error(
        "Selected task could not be found."
      );
      return;
    }

    if (!isTaskCompleted(selectedTaskObject)) {
      toast.error(
        "Student must complete the task before evaluation."
      );
      return;
    }

    /* =====================================================
       FINAL FRONTEND DUPLICATE CHECK
    ===================================================== */

    if (isTaskEvaluated(selectedTask)) {
      toast.error(
        "This task has already been evaluated."
      );
      return;
    }

    if (!rating) {
      toast.error(
        "Please provide a rating."
      );
      return;
    }

    if (
      !technical ||
      !communication ||
      !workEthic
    ) {
      toast.error(
        "Please complete all performance ratings."
      );
      return;
    }

    if (!strengths.trim()) {
      toast.error(
        "Please enter strengths."
      );
      return;
    }

    if (!improvements.trim()) {
      toast.error(
        "Please enter areas for improvement."
      );
      return;
    }

    if (!feedback.trim()) {
      toast.error(
        "Please enter overall feedback."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await authorizedFetch(
        `${API_BASE}/api/evaluations`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            employerId,
            internshipId:
              selectedInternship,
            studentId:
              selectedStudent,
            taskId:
              selectedTask,
            rating,
            technical,
            communication,
            workEthic,
            strengths,
            improvements,
            feedback,
          }),
        }
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 409 ||
          data?.message
            ?.toLowerCase()
            ?.includes("already")
        ) {
          toast.error(
            "This task has already been evaluated."
          );
        } else {
          toast.error(
            data?.message ||
              "Failed to submit evaluation."
          );
        }

        return;
      }

      /* =====================================================
         UPDATE EVALUATION STATE + CACHE
      ===================================================== */

      const updatedEvaluations = [
        data,
        ...evaluations,
      ];

      setEvaluations(
        updatedEvaluations
      );

      saveEvaluationsCache(
        updatedEvaluations
      );

      toast.success(
        "Evaluation submitted successfully."
      );

      /* =====================================================
         CLEAR EVALUATION FORM
      ===================================================== */

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

      toast.error(
        "Failed to submit evaluation."
      );
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

    setStudents([]);
    setTasks([]);

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

                {/* =================================================
                    INTERNSHIP
                ================================================= */}

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

                    setStudents([]);
                    setTasks([]);

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

                {/* =================================================
                    STUDENT
                ================================================= */}

                <label>
                  Select Student
                </label>

                <div className="evaluation-select-wrapper">

                  {loadingStudents ? (
                    <div className="dropdown-loader">
                      <Loader />
                    </div>
                  ) : (
                    <select
                      value={selectedStudent}
                      onChange={(e) => {
                        setSelectedStudent(
                          e.target.value
                        );

                        setSelectedTask("");
                        setTasks([]);

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
                  )}

                </div>

                {/* =================================================
                    TASK
                ================================================= */}

                <label>
                  Select Task
                </label>

                <div className="evaluation-select-wrapper">

                  {loadingTasks ? (
                    <div className="dropdown-loader">
                      <Loader />
                    </div>
                  ) : (
                    <select
                      value={selectedTask}
                      onChange={handleTaskChange}
                      disabled={
                        !selectedStudent ||
                        availableTasks.length === 0
                      }
                    >
                      <option value="">
                        {allCompletedTasksEvaluated
                          ? "All completed tasks already evaluated"
                          : noCompletedTasks
                          ? "No completed tasks available"
                          : "Select completed task"}
                      </option>

                      {availableTasks.map((task) => (
                        <option
                          key={task.id}
                          value={task.id}
                        >
                          {task.title ||
                            task.taskTitle ||
                            `Task ${task.id}`}
                        </option>
                      ))}
                    </select>
                  )}

                </div>

                {/* =================================================
                    ALL COMPLETED TASKS EVALUATED
                ================================================= */}

                {allCompletedTasksEvaluated && (
                  <div className="evaluation-complete" style={{ color: "green" }}>
                    ✓ All completed tasks for this student
                    have already been evaluated.
                  </div>
                )}

                {/* =================================================
                    NO COMPLETED TASKS
                ================================================= */}

                {noCompletedTasks && (
                  <div className="evaluation-complete">
                    No completed tasks are available
                    for evaluation.
                  </div>
                )}

                {/* =================================================
                    INCOMPLETE TASKS EXIST
                ================================================= */}

                {selectedStudent &&
                  !loadingTasks &&
                  hasIncompleteTasks &&
                  availableTasks.length > 0 && (
                    <div className="evaluation-complete">
                      Only completed tasks are available
                      for evaluation. Incomplete tasks
                      cannot be evaluated.
                    </div>
                  )}

                {/* =================================================
                    NO TASKS
                ================================================= */}

                {selectedStudent &&
                  !loadingTasks &&
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

                  {/* TECHNICAL */}

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

                  {/* COMMUNICATION */}

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

                  {/* WORK ETHIC */}

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
                  Overall Feedback
                </label>

                <textarea
                  placeholder="Enter overall feedback..."
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
                      allCompletedTasksEvaluated
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