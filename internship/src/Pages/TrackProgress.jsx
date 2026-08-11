import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Headerfordash from "../Components/Headerfordash";
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
  CheckCircle,
  ClipboardList,
  Upload,
} from "lucide-react";


/* =========================================================
   API
========================================================= */

const API_BASE =
  "https://remote-internship-30135.onrender.com";


/* =========================================================
   LOCAL STORAGE KEYS
========================================================= */

const TOKEN_KEY =
  "token";

const ADMIN_PROFILE_KEY =
  "adminProfile";

const TRACK_PROGRESS_CACHE_KEY =
  "adminTrackProgressData";

const TASKS_CACHE_KEY =
  "adminTrackProgressTasks";


const TrackProgress = () => {

  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [approvedStudents, setApprovedStudents] =
    useState([]);

  const [tasksData, setTasksData] =
    useState([]);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [newTask, setNewTask] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [taskLoading, setTaskLoading] =
    useState(false);

  const [internships, setInternships] =
    useState([]);

  const [selectedInternship, setSelectedInternship] =
    useState("");


  /* =========================================================
     ADMIN
  ========================================================= */

  const getStoredAdmin = () => {

    try {

      const storedAdmin =
        localStorage.getItem(
          ADMIN_PROFILE_KEY
        );


      return storedAdmin
        ? JSON.parse(storedAdmin)
        : {};

    } catch (error) {

      console.error(
        "Failed to read admin profile:",
        error
      );

      return {};
    }
  };


  const admin =
    getStoredAdmin();


  const employerId =
    admin?.id;


  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {

    /*
     * Clear JWT
     */
    localStorage.removeItem(
      TOKEN_KEY
    );


    /*
     * Clear admin profile
     */
    localStorage.removeItem(
      ADMIN_PROFILE_KEY
    );


    /*
     * Clear Track Progress cache
     */
    localStorage.removeItem(
      TRACK_PROGRESS_CACHE_KEY
    );


    /*
     * Clear task cache
     */
    localStorage.removeItem(
      TASKS_CACHE_KEY
    );


    /*
     * Clear dashboard cache
     */
    localStorage.removeItem(
      "adminDashboardData"
    );


    /*
     * Clear other auth data
     */
    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "admin"
    );


    /*
     * Redirect
     */
    navigate("/login", {
      replace: true,
    });
  };


  /* =========================================================
     JWT EXPIRATION
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


      if (
        parts.length !== 3
      ) {
        return null;
      }


      const payload =
        JSON.parse(
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
       * JWT exp is seconds.
       * JavaScript uses milliseconds.
       */
      return (
        payload.exp * 1000
      );

    } catch (error) {

      console.error(
        "Invalid JWT:",
        error
      );

      return null;
    }
  };


  /* =========================================================
     CHECK JWT
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
     * No exp in token
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
     JWT AUTO LOGOUT TIMER
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
      if (
        remainingTime <= 0
      ) {

        toast.error(
          "Your session has expired. Please login again."
        );


        logout();


        return null;
      }


      /*
       * Automatically logout
       * exactly when JWT expires.
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
     SAVE MAIN TRACK PROGRESS CACHE
     
     Stores:
       - applications
       - internships
  ========================================================= */

  const saveMainCache = (
    applicationData,
    internshipData
  ) => {

    try {

      const cacheData = {

        employerId,

        applications:
          Array.isArray(
            applicationData
          )
            ? applicationData
            : [],

        internships:
          Array.isArray(
            internshipData
          )
            ? internshipData
            : [],

        cachedAt:
          Date.now(),
      };


      localStorage.setItem(
        TRACK_PROGRESS_CACHE_KEY,
        JSON.stringify(
          cacheData
        )
      );

    } catch (error) {

      console.error(
        "Failed to save Track Progress cache:",
        error
      );
    }
  };


  /* =========================================================
     LOAD MAIN CACHE
  ========================================================= */

  const loadMainCache = () => {

    try {

      const cached =
        localStorage.getItem(
          TRACK_PROGRESS_CACHE_KEY
        );


      /*
       * No cache
       */
      if (!cached) {
        return null;
      }


      const data =
        JSON.parse(
          cached
        );


      if (!data) {
        return null;
      }


      /*
       * Make sure cache belongs
       * to current admin.
       */
      if (
        data.employerId &&
        employerId &&
        Number(
          data.employerId
        ) !==
          Number(employerId)
      ) {

        localStorage.removeItem(
          TRACK_PROGRESS_CACHE_KEY
        );


        return null;
      }


      return data;

    } catch (error) {

      console.error(
        "Failed to read Track Progress cache:",
        error
      );


      localStorage.removeItem(
        TRACK_PROGRESS_CACHE_KEY
      );


      return null;
    }
  };


  /* =========================================================
     GET APPROVED STUDENTS FROM APPLICATIONS
     
     IMPORTANT:
     This is local filtering.
     No API request.
  ========================================================= */

  const getApprovedStudentsFromApplications =
    (
      applicationData,
      internshipId
    ) => {

      if (
        !internshipId
      ) {
        return [];
      }


      return applicationData.filter(
        (app) =>
          app.status
            ?.toUpperCase() ===
            "APPROVED" &&

          Number(
            app.internshipId
          ) ===
            Number(
              internshipId
            )
      );
    };


  /* =========================================================
     LOAD DATA FROM API
     
     ONLY CALLED WHEN CACHE DOES NOT EXIST.
  ========================================================= */

  const loadData = async () => {

    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    if (!employerId) {

      toast.error(
        "Employer not found. Please login again."
      );


      navigate("/login");


      return;
    }


    try {

      setLoading(true);


      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      /* =====================================================
         APPLICATIONS
      ===================================================== */

      const applicationsRes =
        await fetch(
          `${API_BASE}/api/applications/employer/${employerId}`,
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
        applicationsRes.status === 401 ||
        applicationsRes.status === 403
      ) {

        toast.error(
          "Your session has expired. Please login again."
        );


        logout();


        return;
      }


      if (
        !applicationsRes.ok
      ) {

        throw new Error(
          "Failed to load applications"
        );
      }


      const applications =
        await applicationsRes.json();


      const safeApplications =
        Array.isArray(
          applications
        )
          ? applications
          : [];


      /* =====================================================
         INTERNSHIPS
      ===================================================== */

      const internshipsRes =
        await fetch(
          `${API_BASE}/api/internships/employer/${employerId}`,
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
        internshipsRes.status === 401 ||
        internshipsRes.status === 403
      ) {

        toast.error(
          "Your session has expired. Please login again."
        );


        logout();


        return;
      }


      if (
        !internshipsRes.ok
      ) {

        throw new Error(
          "Failed to load internships"
        );
      }


      const internshipData =
        await internshipsRes.json();


      const safeInternships =
        Array.isArray(
          internshipData
        )
          ? internshipData
          : [];


      /* =====================================================
         SAVE STATE
      ===================================================== */

      setInternships(
        safeInternships
      );


      /*
       * Calculate approved students
       * locally if an internship is selected.
       */
      const approved =
        getApprovedStudentsFromApplications(
          safeApplications,
          selectedInternship
        );


      setApprovedStudents(
        approved
      );


      /* =====================================================
         SAVE CACHE
      ===================================================== */

      saveMainCache(
        safeApplications,
        safeInternships
      );

    } catch (error) {

      console.error(
        "Track progress error:",
        error
      );


      setApprovedStudents([]);

      setInternships([]);


      toast.error(
        "Couldn't load progress data."
      );

    } finally {

      setLoading(false);
    }
  };


  /* =========================================================
     INITIAL LOAD
     
     IMPORTANT:
     selectedInternship is NOT a dependency.
     
     Therefore changing internship does NOT
     call the API again.
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
     * Setup automatic logout.
     */
    const timer =
      setupTokenExpirationTimer();


    /*
     * Check cache first.
     */
    const cached =
      loadMainCache();


    if (cached) {

      /*
       * Restore internships.
       */
      const cachedInternships =
        Array.isArray(
          cached.internships
        )
          ? cached.internships
          : [];


      /*
       * Restore applications.
       */
      const cachedApplications =
        Array.isArray(
          cached.applications
        )
          ? cached.applications
          : [];


      setInternships(
        cachedInternships
      );


      /*
       * Derive approved students
       * locally.
       */
      const approved =
        getApprovedStudentsFromApplications(
          cachedApplications,
          selectedInternship
        );


      setApprovedStudents(
        approved
      );


      /*
       * No API request.
       */
      setLoading(false);

    } else {

      /*
       * No cache.
       *
       * Fetch ONCE.
       */
      loadData();
    }


    return () => {

      if (timer) {
        clearTimeout(timer);
      }

    };

  }, []);


  /* =========================================================
     UPDATE APPROVED STUDENTS WHEN INTERNSHIP CHANGES
     
     IMPORTANT:
     This only reads localStorage.
     No API request.
  ========================================================= */

  useEffect(() => {

    if (!selectedInternship) {

      setApprovedStudents([]);

      setSelectedStudent(null);

      setTasksData([]);

      return;
    }


    const cached =
      loadMainCache();


    if (!cached) {
      return;
    }


    const cachedApplications =
      Array.isArray(
        cached.applications
      )
        ? cached.applications
        : [];


    const approved =
      getApprovedStudentsFromApplications(
        cachedApplications,
        selectedInternship
      );


    setApprovedStudents(
      approved
    );


    /*
     * Clear selected student
     * when internship changes.
     */
    setSelectedStudent(null);


    /*
     * Clear currently displayed tasks.
     */
    setTasksData([]);

  }, [selectedInternship]);


  /* =========================================================
     CHECK JWT WHEN RETURNING TO TAB
     
     IMPORTANT:
     Does NOT fetch anything.
  ========================================================= */

  useEffect(() => {

    const handleVisibilityChange =
      () => {

        if (
          document.visibilityState ===
          "visible"
        ) {

          /*
           * Only check JWT.
           *
           * NO loadData()
           */
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
     TASK CACHE KEY
  ========================================================= */

  const getTaskCacheKey = (
    studentId,
    internshipId
  ) => {

    return `${studentId}_${internshipId}`;
  };


  /* =========================================================
     LOAD ALL TASK CACHES
  ========================================================= */

  const getAllTaskCaches = () => {

    try {

      const cached =
        localStorage.getItem(
          TASKS_CACHE_KEY
        );


      if (!cached) {
        return {};
      }


      const data =
        JSON.parse(
          cached
        );


      return data &&
        typeof data ===
          "object"
        ? data
        : {};

    } catch (error) {

      console.error(
        "Task cache read error:",
        error
      );


      return {};
    }
  };


  /* =========================================================
     SAVE TASK CACHE
  ========================================================= */

  const saveTaskCache = (
    studentId,
    internshipId,
    taskData
  ) => {

    try {

      const allCaches =
        getAllTaskCaches();


      const key =
        getTaskCacheKey(
          studentId,
          internshipId
        );


      allCaches[key] = {

        studentId,

        internshipId,

        tasks:
          Array.isArray(
            taskData
          )
            ? taskData
            : [],

        cachedAt:
          Date.now(),
      };


      localStorage.setItem(
        TASKS_CACHE_KEY,
        JSON.stringify(
          allCaches
        )
      );

    } catch (error) {

      console.error(
        "Failed to save task cache:",
        error
      );
    }
  };


  /* =========================================================
     LOAD TASKS FROM CACHE
  ========================================================= */

  const loadCachedTasks = (
    studentId,
    internshipId
  ) => {

    try {

      const allCaches =
        getAllTaskCaches();


      const key =
        getTaskCacheKey(
          studentId,
          internshipId
        );


      const cached =
        allCaches[key];


      if (!cached) {
        return null;
      }


      const safeTasks =
        Array.isArray(
          cached.tasks
        )
          ? cached.tasks
          : [];


      return safeTasks;

    } catch (error) {

      console.error(
        "Failed to load cached tasks:",
        error
      );


      return null;
    }
  };


  /* =========================================================
     LOAD STUDENT TASKS
     
     CACHE FIRST.
  ========================================================= */

  const loadTasks = async (
    student
  ) => {

    if (!student) {
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


    const studentId =
      student.studentId;


    const internshipId =
      Number(
        selectedInternship
      );


    if (
      !studentId ||
      !internshipId
    ) {
      return;
    }


    /* =====================================================
       CHECK CACHE
    ===================================================== */

    const cachedTasks =
      loadCachedTasks(
        studentId,
        internshipId
      );


    if (
      cachedTasks !== null
    ) {

      /*
       * CACHE EXISTS.
       *
       * No API request.
       */
      const sortedTasks =
        [...cachedTasks].sort(
          (a, b) =>
            Number(b.id) -
            Number(a.id)
        );


      setTasksData(
        sortedTasks
      );


      setTaskLoading(
        false
      );


      return;
    }


    /* =====================================================
       NO CACHE → API
    ===================================================== */

    try {

      setTaskLoading(true);


      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const res =
        await fetch(
          `${API_BASE}/api/tasks/student/${studentId}/internship/${internshipId}`,
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


      const safeData =
        Array.isArray(data)
          ? data
          : [];


      /*
       * Sort newest first.
       */
      safeData.sort(
        (a, b) =>
          Number(b.id) -
          Number(a.id)
      );


      /*
       * Update state.
       */
      setTasksData(
        safeData
      );


      /*
       * IMPORTANT:
       * Save task data in cache.
       */
      saveTaskCache(
        studentId,
        internshipId,
        safeData
      );

    } catch (error) {

      console.error(
        "Task loading error:",
        error
      );


      setTasksData([]);


    } finally {

      setTaskLoading(false);
    }
  };


  /* =========================================================
     PROGRESS
  ========================================================= */

  const getProgress = () => {

    if (
      !tasksData ||
      tasksData.length === 0
    ) {

      return 0;
    }


    const total =
      tasksData.length;


    const completed =
      tasksData.filter(
        (task) =>
          task.status
            ?.toUpperCase() ===
          "COMPLETED"
      ).length;


    return Math.round(
      (completed /
        total) *
        100
    );
  };


  /* =========================================================
     ADD TASK
  ========================================================= */

  const handleAddTask = async (
    e
  ) => {

    e.preventDefault();


    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    if (!selectedStudent) {

      toast(
        "Please select a student first.",
        {
          icon: "⚠️",
        }
      );


      return;
    }


    if (!selectedInternship) {

      toast(
        "Please select an internship first.",
        {
          icon: "⚠️",
        }
      );


      return;
    }


    if (!newTask.trim()) {

      toast(
        "Please enter a task!",
        {
          icon: "⚠️",
        }
      );


      return;
    }


    try {

      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const res =
        await fetch(
          `${API_BASE}/api/tasks`,
          {
            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({

                studentId:
                  selectedStudent.studentId,

                internshipId:
                  Number(
                    selectedInternship
                  ),

                title:
                  newTask.trim(),

                description:
                  newTask.trim(),
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

        const errorText =
          await res.text();


        throw new Error(
          errorText ||
            "Failed to assign task"
        );
      }


      const createdTask =
        await res.json();


      /*
       * Add new task to current state.
       */
      const updatedTasks = [
        createdTask,
        ...tasksData,
      ];


      /*
       * Sort newest first.
       */
      updatedTasks.sort(
        (a, b) =>
          Number(b.id) -
          Number(a.id)
      );


      setTasksData(
        updatedTasks
      );


      /*
       * IMPORTANT:
       * Update task cache immediately.
       */
      saveTaskCache(
        selectedStudent.studentId,
        Number(
          selectedInternship
        ),
        updatedTasks
      );


      toast.success(
        "Task assigned successfully!"
      );


      setNewTask("");

      setSelectedFile(
        null
      );

    } catch (error) {

      console.error(
        "Task assignment error:",
        error
      );


      toast(
        "Error assigning task.",
        {
          icon: "⚠️",
        }
      );
    }
  };


  /* =========================================================
     SELECT INTERNSHIP
     
     IMPORTANT:
     No API request.
  ========================================================= */

  const handleInternshipChange = (
    e
  ) => {

    const value =
      e.target.value;


    setSelectedInternship(
      value
    );


    setSelectedStudent(
      null
    );


    setTasksData(
      []
    );
  };


  /* =========================================================
     SELECT STUDENT
     
     Task API is called only if
     that student's tasks aren't cached.
  ========================================================= */

  const handleStudentClick = (
    student
  ) => {

    if (
      selectedStudent?.id ===
      student.id
    ) {

      setSelectedStudent(
        null
      );


      setTasksData(
        []
      );


      return;
    }


    setSelectedStudent(
      student
    );


    loadTasks(
      student
    );
  };


  /* =========================================================
     NAV BUTTON
  ========================================================= */

  const NavButton = ({
    active,
    icon: Icon,
    label,
    onClick,
  }) => {

    return (

      <button
        type="button"
        className={`sd-nav-button ${
          active
            ? "active"
            : ""
        }`}
        onClick={
          onClick
        }
        aria-current={
          active
            ? "page"
            : undefined
        }
      >

        <Icon
          size={20}
        />


        <span>
          {label}
        </span>

      </button>
    );
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      <div className="admin-layout">


        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="sd-sidebar">

          <nav className="sd-nav">


            {/* Dashboard */}

            <NavButton
              icon={
                LayoutDashboard
              }
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/admin-dashboard"
                )
              }
            />


            {/* Post Internship */}

            <NavButton
              icon={
                FileText
              }
              label="Post Internship"
              onClick={() =>
                navigate(
                  "/post-internship"
                )
              }
            />


            {/* Applications */}

            <NavButton
              icon={
                Users
              }
              label="Applications"
              onClick={() =>
                navigate(
                  "/applications"
                )
              }
            />


            {/* Track Progress */}

            <NavButton
              active
              icon={
                TrendingUp
              }
              label="Track Progress"
              onClick={() =>
                navigate(
                  "/track-progress"
                )
              }
            />


            {/* Evaluations */}

            <NavButton
              icon={
                ClipboardCheck
              }
              label="Evaluations"
              onClick={() =>
                navigate(
                  "/evaluations"
                )
              }
            />


            {/* Profile */}

            <NavButton
              icon={
                User
              }
              label="Profile"
              onClick={() =>
                navigate(
                  "/admin-profile"
                )
              }
            />

          </nav>

        </aside>


        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="sd-main">


          {loading ? (

            <Loader />

          ) : (

            <>


              {/* =============================================
                  HEADER
              ============================================= */}

              <div className="sd-header-section">

                <h1>
                  Track Progress
                </h1>


                <p>
                  Select an internship,
                  choose a student, and
                  manage their tasks.
                </p>

              </div>


              {/* =============================================
                  INTERNSHIP SELECT
              ============================================= */}

              <section className="tp-select-card">

                <div className="tp-select-header">

                  <div className="tp-select-icon">

                    <FileText
                      size={20}
                    />

                  </div>


                  <div>

                    <h2>
                      Select Internship
                    </h2>


                    <p>
                      Choose an internship
                      to view approved
                      students.
                    </p>

                  </div>

                </div>


                <select
                  className="internship-select"
                  value={
                    selectedInternship
                  }
                  onChange={
                    handleInternshipChange
                  }
                >

                  <option value="">
                    Select Internship
                  </option>


                  {internships.map(
                    (internship) => (

                      <option
                        key={
                          internship.id
                        }
                        value={
                          internship.id
                        }
                      >

                        {
                          internship.title
                        }

                      </option>

                    )
                  )}

                </select>

              </section>


              {/* =============================================
                  NO INTERNSHIP
              ============================================= */}

              {!selectedInternship && (

                <section className="sd-card">

                  <div className="tp-empty">

                    <FileText
                      size={40}
                    />


                    <h3>
                      Select an internship
                    </h3>


                    <p>
                      Please select an
                      internship above to
                      view approved students.
                    </p>

                  </div>

                </section>

              )}


              {/* =============================================
                  STUDENTS
              ============================================= */}

              {selectedInternship && (

                <section className="tp-students-section">

                  <div className="tp-section-header">

                    <div>

                      <h2>
                        Approved Students
                      </h2>


                      <p>
                        Select a student to
                        view their progress.
                      </p>

                    </div>


                    <span className="tp-count">

                      {
                        approvedStudents.length
                      }

                    </span>

                  </div>


                  {approvedStudents.length ===
                  0 ? (

                    <div className="sd-card">

                      <div className="tp-empty">

                        <Users
                          size={40}
                        />


                        <h3>
                          No approved students
                        </h3>


                        <p>
                          There are no approved
                          students for this
                          internship yet.
                        </p>

                      </div>

                    </div>

                  ) : (

                    <div className="stats-grid-tp">

                      {approvedStudents.map(
                        (student) => {

                          const isSelected =
                            selectedStudent?.id ===
                            student.id;


                          return (

                            <div
                              key={
                                student.id
                              }
                              className={`tp-student-card ${
                                isSelected
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleStudentClick(
                                  student
                                )
                              }
                            >

                              <div className="tp-student-icon">

                                <User
                                  size={22}
                                />

                              </div>


                              <div className="tp-student-info">

                                <h3>

                                  {
                                    student.fullName ||
                                    "Student"
                                  }

                                </h3>


                                <p>

                                  {isSelected
                                    ? `${getProgress()}% Completed`
                                    : "Click to view progress"}

                                </p>

                              </div>


                              {isSelected && (

                                <CheckCircle
                                  className="tp-selected-icon"
                                  size={20}
                                />

                              )}

                            </div>

                          );

                        }
                      )}

                    </div>

                  )}

                </section>

              )}


              {/* =============================================
                  SELECTED STUDENT
              ============================================= */}

              {selectedStudent && (

                <section className="tp-progress-section">


                  <div className="tp-progress-header">

                    <div>

                      <h2>
                        {
                          selectedStudent.fullName
                        }
                      </h2>


                      <p>

                        {
                          selectedStudent
                            .internship
                            ?.title ||
                          "Internship Progress"
                        }

                      </p>

                    </div>


                    <div className="tp-progress-value">

                      {
                        getProgress()
                      }%

                    </div>

                  </div>


                  {/* =========================================
                      PROGRESS BAR
                  ========================================= */}

                  <div className="progress-bar">

                    <div
                      className="progress-fill"
                      style={{
                        width:
                          `${getProgress()}%`,
                      }}
                    />

                  </div>


                  {/* =========================================
                      TASK ASSIGNMENT
                  ========================================= */}

                  <div className="task-assignment">

                    <h3>
                      Assign New Task
                    </h3>


                    <p>
                      Create a task for this
                      student.
                    </p>


                    <form
                      onSubmit={
                        handleAddTask
                      }
                    >

                      <input
                        className="task-input"
                        type="text"
                        placeholder="Enter new task..."
                        value={
                          newTask
                        }
                        onChange={(e) =>
                          setNewTask(
                            e.target.value
                          )
                        }
                      />


                      {/* FILE DROP ZONE */}

                      <div
                        className="file-dropzone"
                        onDragOver={(e) =>
                          e.preventDefault()
                        }
                        onDrop={(e) => {

                          e.preventDefault();


                          const file =
                            e.dataTransfer
                              .files[0];


                          if (file) {

                            setSelectedFile(
                              file
                            );
                          }

                        }}
                      >

                        <Upload
                          size={28}
                        />


                        <p>
                          Drag & Drop a file
                          or choose one below.
                        </p>


                        <input
                          type="file"
                          onChange={(e) =>
                            setSelectedFile(
                              e.target
                                .files?.[0] ||
                              null
                            )
                          }
                        />


                        {selectedFile && (

                          <div className="selected-file">

                            <CheckCircle
                              size={16}
                            />


                            <span>

                              {
                                selectedFile.name
                              }

                            </span>

                          </div>

                        )}

                      </div>


                      <button
                        type="submit"
                        className="assign-btn"
                      >

                        <ClipboardList
                          size={18}
                        />


                        Assign Task

                      </button>

                    </form>

                  </div>


                  {/* =========================================
                      TASKS
                  ========================================= */}

                  <div className="tp-tasks">

                    <div className="tp-tasks-header">

                      <div>

                        <h3>
                          Assigned Tasks
                        </h3>


                        <p>
                          Track the student's
                          submitted work.
                        </p>

                      </div>


                      <span>

                        {
                          tasksData.length
                        }

                      </span>

                    </div>


                    {taskLoading ? (

                      <Loader />

                    ) : tasksData.length ===
                      0 ? (

                      <div className="tp-no-tasks">

                        <ClipboardList
                          size={36}
                        />


                        <h4>
                          No tasks assigned yet
                        </h4>


                        <p>
                          Assign a task above
                          to get started.
                        </p>

                      </div>

                    ) : (

                      tasksData.map(
                        (task) => (

                          <div
                            key={
                              task.id
                            }
                            className="tp-task-card"
                          >

                            <div className="tp-task-top">

                              <div>

                                <h4>
                                  {
                                    task.title
                                  }
                                </h4>


                                <p>

                                  Status:{" "}

                                  <strong>

                                    {
                                      task.status
                                    }

                                  </strong>

                                </p>

                              </div>


                              <span
                                className={`task-status ${
                                  task.status
                                    ?.toLowerCase()
                                    .replace(
                                      /\s+/g,
                                      "-"
                                    )
                                }`}
                              >

                                {
                                  task.status ||
                                  "Pending"
                                }

                              </span>

                            </div>


                            {/* =================================
                                COMPLETED TASK DETAILS
                            ================================= */}

                            {task.status
                              ?.toUpperCase() ===
                              "COMPLETED" && (

                              <div className="task-submission">


                                {task.submissionDescription && (

                                  <div className="submission-item">

                                    <strong>
                                      Student Description
                                    </strong>


                                    <p>

                                      {
                                        task.submissionDescription
                                      }

                                    </p>

                                  </div>

                                )}


                                {task.submissionFileName && (

                                  <a
                                    href={`${API_BASE}/api/tasks/file/${task.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="task-file-link"
                                  >

                                    <FileText
                                      size={16}
                                    />


                                    View Uploaded File


                                    <span>

                                      (
                                      {
                                        task.submissionFileName
                                      }
                                      )

                                    </span>

                                  </a>

                                )}

                              </div>

                            )}

                          </div>

                        )

                      )

                    )}

                  </div>

                </section>

              )}

            </>

          )}

        </main>

      </div>

    </>
  );
};


export default TrackProgress;