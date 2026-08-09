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

const TrackProgress = () => {
  const navigate = useNavigate();

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
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadData();
  }, [selectedInternship]);


  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = async () => {
    try {
      setLoading(true);

      const storedAdmin =
        localStorage.getItem("adminProfile");

      const admin = storedAdmin
        ? JSON.parse(storedAdmin)
        : {};

      const employerId = admin?.id;

      const token =
        localStorage.getItem("token");

      if (!employerId) {
        toast.error(
          "Employer not found. Please login again."
        );

        navigate("/login");

        return;
      }


      /* =============================================
         APPLICATIONS
      ============================================= */

      const applicationsRes =
        await fetch(
          `https://remote-internship-30135.onrender.com/api/applications/employer/${employerId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      if (!applicationsRes.ok) {
        throw new Error(
          "Failed to load applications"
        );
      }


      const applications =
        await applicationsRes.json();


      const safeApplications =
        Array.isArray(applications)
          ? applications
          : [];


      let approved = [];


      if (selectedInternship) {
        approved =
          safeApplications.filter(
            (app) =>
              app.status === "APPROVED" &&
              Number(app.internshipId) ===
                Number(selectedInternship)
          );
      }


      setApprovedStudents(
        approved
      );


      /* =============================================
         INTERNSHIPS
      ============================================= */

      const internshipsRes =
        await fetch(
          `https://remote-internship-30135.onrender.com/api/internships/employer/${employerId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      if (!internshipsRes.ok) {
        throw new Error(
          "Failed to load internships"
        );
      }


      const internshipData =
        await internshipsRes.json();


      setInternships(
        Array.isArray(
          internshipData
        )
          ? internshipData
          : []
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
     LOAD STUDENT TASKS
  ========================================================= */

  const loadTasks = async (student) => {
    if (!student) return;

    try {
      setTaskLoading(true);

      const studentId =
        student.studentId;

      const internshipId =
        Number(selectedInternship);

      const token =
        localStorage.getItem("token");


      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/tasks/student/${studentId}/internship/${internshipId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


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


      safeData.sort(
        (a, b) =>
          Number(b.id) -
          Number(a.id)
      );


      setTasksData(
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
      (completed / total) * 100
    );
  };


  /* =========================================================
     ADD TASK
  ========================================================= */

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast("Please select a student first.", {
        icon: "⚠️",
      });

      return;
    }


    if (!selectedInternship) {
      toast("Please select an internship first.", {
        icon: "⚠️",
      });

      return;
    }


    if (!newTask.trim()) {
      toast("Please enter a task!", {
        icon: "⚠️",
      });

      return;
    }


    try {
      const token =
        localStorage.getItem("token");


      const res = await fetch(
        "https://remote-internship-30135.onrender.com/api/tasks",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
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


      if (!res.ok) {
        const errorText =
          await res.text();

        throw new Error(
          errorText ||
            "Failed to assign task"
        );
      }


      toast.success(
        "Task assigned successfully!"
      );


      setNewTask("");

      setSelectedFile(null);


      loadTasks(
        selectedStudent
      );

    } catch (error) {
      console.error(
        "Task assignment error:",
        error
      );

      toast("Error assigning task.", {
        icon: "⚠️",
      });
    }
  };


  /* =========================================================
     SELECT INTERNSHIP
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

    setTasksData([]);
  };


  /* =========================================================
     SELECT STUDENT
  ========================================================= */

  const handleStudentClick = (
    student
  ) => {
    if (
      selectedStudent?.id ===
      student.id
    ) {
      setSelectedStudent(null);

      setTasksData([]);

      return;
    }


    setSelectedStudent(
      student
    );

    loadTasks(student);
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

            <NavButton
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/admin-dashboard"
                )
              }
            />


            <NavButton
              icon={FileText}
              label="Post Internship"
              onClick={() =>
                navigate(
                  "/post-internship"
                )
              }
            />


            <NavButton
              icon={Users}
              label="Applications"
              onClick={() =>
                navigate(
                  "/applications"
                )
              }
            />


            <NavButton
              active
              icon={TrendingUp}
              label="Track Progress"
              onClick={() =>
                navigate(
                  "/track-progress"
                )
              }
            />


            <NavButton
              icon={ClipboardCheck}
              label="Evaluations"
              onClick={() =>
                navigate(
                  "/evaluations"
                )
              }
            />


            <NavButton
              icon={User}
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
            MAIN CONTENT
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
                        {internship.title}
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
                      {approvedStudents.length}
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
                                  {student.fullName ||
                                    "Student"}
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
                        {selectedStudent.fullName}
                      </h2>

                      <p>
                        {selectedStudent
                          .internship
                          ?.title ||
                          "Internship Progress"}
                      </p>

                    </div>

                    <div className="tp-progress-value">
                      {getProgress()}%
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
                              {selectedFile.name}
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
                        {tasksData.length}
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
                            key={task.id}
                            className="tp-task-card"
                          >

                            <div className="tp-task-top">

                              <div>

                                <h4>
                                  {task.title}
                                </h4>

                                <p>
                                  Status:{" "}
                                  <strong>
                                    {task.status}
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
                                {task.status ||
                                  "Pending"}
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
                                    href={`https://remote-internship-30135.onrender.com/api/tasks/file/${task.id}`}
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