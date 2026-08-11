import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Headerfordash from "../Components/Headerfordash";
import Loader from "../Components/Loader";

import "../Styles/Postinternship.css";

import toast from "react-hot-toast";

import {
  FileText,
  Users,
  User,
  TrendingUp,
  LayoutDashboard,
  ClipboardCheck,
} from "lucide-react";


/* =========================================================
   API + LOCAL STORAGE KEYS
========================================================= */

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY =
  "token";

const ADMIN_PROFILE_KEY =
  "adminProfile";

const ADMIN_DASHBOARD_CACHE_KEY =
  "adminDashboardData";

const POSTED_INTERNSHIPS_CACHE_KEY =
  "adminPostedInternships";


const Postinternship = () => {

  const navigate = useNavigate();


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
     STATE
  ========================================================= */

  const [internships, setInternships] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /* =========================================================
     DELETE CONFIRMATION
  ========================================================= */

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteInternshipId, setDeleteInternshipId] =
    useState(null);


  /* =========================================================
     FORM
  ========================================================= */

  const [form, setForm] =
    useState({
      title: "",

      companyname:
        admin?.companyname || "",

      duration: "",

      location: "Remote",

      stipend: "",

      description: "",

      requirements: "",

      skills: "",
    });


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
     * Remove admin profile
     */
    localStorage.removeItem(
      ADMIN_PROFILE_KEY
    );


    /*
     * Remove this page cache
     */
    localStorage.removeItem(
      POSTED_INTERNSHIPS_CACHE_KEY
    );


    /*
     * Remove dashboard cache
     */
    localStorage.removeItem(
      ADMIN_DASHBOARD_CACHE_KEY
    );


    /*
     * Remove possible generic auth data
     */
    localStorage.removeItem("user");

    localStorage.removeItem("admin");


    /*
     * Redirect
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
       * JWT exp = seconds
       * JavaScript Date = milliseconds
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
     CHECK JWT EXPIRATION
  ========================================================= */

  const checkTokenExpiration = () => {

    const token =
      localStorage.getItem(
        TOKEN_KEY
      );


    /*
     * No JWT
     */
    if (!token) {

      logout();

      return false;
    }


    const expirationTime =
      getTokenExpiration();


    /*
     * Token doesn't have exp
     */
    if (!expirationTime) {
      return true;
    }


    /*
     * JWT expired
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
       * when JWT expires.
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
     SAVE INTERNSHIPS TO CACHE
  ========================================================= */

  const saveInternshipsCache = (
    internshipData
  ) => {

    try {

      const cacheData = {
        employerId,

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
        POSTED_INTERNSHIPS_CACHE_KEY,
        JSON.stringify(
          cacheData
        )
      );

    } catch (error) {

      console.error(
        "Failed to save internships cache:",
        error
      );
    }
  };


  /* =========================================================
     SAVE ADMIN DASHBOARD CACHE
     
     We update the internships part of the
     dashboard cache as well.
  ========================================================= */

  const updateDashboardInternshipCache =
    (updatedInternships) => {

      try {

        const existing =
          localStorage.getItem(
            ADMIN_DASHBOARD_CACHE_KEY
          );


        if (!existing) {
          return;
        }


        const dashboardData =
          JSON.parse(
            existing
          );


        if (!dashboardData) {
          return;
        }


        /*
         * Make sure the cache belongs
         * to this admin.
         */
        if (
          dashboardData.adminId &&
          employerId &&
          Number(
            dashboardData.adminId
          ) !== Number(employerId)
        ) {
          return;
        }


        const updatedDashboard = {
          ...dashboardData,

          internships:
            Array.isArray(
              updatedInternships
            )
              ? updatedInternships
              : [],

          cachedAt:
            Date.now(),
        };


        localStorage.setItem(
          ADMIN_DASHBOARD_CACHE_KEY,
          JSON.stringify(
            updatedDashboard
          )
        );

      } catch (error) {

        console.error(
          "Failed to update dashboard cache:",
          error
        );
      }
    };


  /* =========================================================
     LOAD INTERNSHIPS FROM CACHE
  ========================================================= */

  const loadCachedInternships =
    () => {

      try {

        const cached =
          localStorage.getItem(
            POSTED_INTERNSHIPS_CACHE_KEY
          );


        /*
         * No cache
         */
        if (!cached) {
          return false;
        }


        const data =
          JSON.parse(
            cached
          );


        if (!data) {
          return false;
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
          ) !== Number(employerId)
        ) {

          localStorage.removeItem(
            POSTED_INTERNSHIPS_CACHE_KEY
          );


          return false;
        }


        const cachedInternships =
          Array.isArray(
            data.internships
          )
            ? data.internships
            : [];


        setInternships(
          cachedInternships
        );


        return true;

      } catch (error) {

        console.error(
          "Failed to load internship cache:",
          error
        );


        localStorage.removeItem(
          POSTED_INTERNSHIPS_CACHE_KEY
        );


        return false;
      }
    };


  /* =========================================================
     LOAD INTERNSHIPS FROM API
  ========================================================= */

  const loadInternships =
    async () => {

      /*
       * Check JWT
       */
      if (
        !checkTokenExpiration()
      ) {
        return;
      }


      if (!employerId) {

        setLoading(false);


        toast(
          "Employer not found. Please login again.",
          {
            icon: "⚠️",
          }
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


        const res =
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
            "Failed to fetch internships"
          );
        }


        const data =
          await res.json();


        const internshipData =
          Array.isArray(data)
            ? data
            : [];


        /*
         * Update React state
         */
        setInternships(
          internshipData
        );


        /*
         * Save page cache
         */
        saveInternshipsCache(
          internshipData
        );


        /*
         * Update dashboard cache
         */
        updateDashboardInternshipCache(
          internshipData
        );

      } catch (error) {

        console.error(
          "Error loading internships:",
          error
        );


        setInternships([]);


        toast.error(
          "Couldn't load internships."
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
     4. Cache exists → NO API
     5. Cache doesn't exist → API ONCE
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
     * Check localStorage
     */
    const hasCache =
      loadCachedInternships();


    if (hasCache) {

      /*
       * CACHE EXISTS
       *
       * Do NOT fetch.
       */
      setLoading(false);

    } else {

      /*
       * NO CACHE
       *
       * Fetch only once.
       */
      loadInternships();
    }


    /*
     * Cleanup timer
     */
    return () => {

      if (timer) {
        clearTimeout(timer);
      }

    };

  }, [employerId]);


  /* =========================================================
     CHECK JWT WHEN RETURNING TO TAB

     IMPORTANT:
     Does NOT call loadInternships().
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
           * NO API request.
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
     INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm(
      (previous) => ({
        ...previous,

        [name]:
          value,
      })
    );
  };


  /* =========================================================
     POST INTERNSHIP
  ========================================================= */

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      /*
       * Check JWT
       */
      if (
        !checkTokenExpiration()
      ) {
        return;
      }


      /*
       * Validate
       */
      if (
        !form.title.trim() ||
        !form.duration ||
        !form.location
      ) {

        toast.error(
          "Please fill in all required fields."
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
            `${API_BASE}/api/internships?employerId=${employerId}`,
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
                  ...form,

                  companyname:
                    admin.companyname ||
                    "",
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
            "Failed to post internship"
          );
        }


        const data =
          await res.json();


        /*
         * Add new internship
         * to current state.
         */
        const updatedInternships = [
          data,
          ...internships,
        ];


        setInternships(
          updatedInternships
        );


        /*
         * IMPORTANT:
         * Update localStorage immediately.
         */
        saveInternshipsCache(
          updatedInternships
        );


        /*
         * IMPORTANT:
         * Update Admin Dashboard cache too.
         */
        updateDashboardInternshipCache(
          updatedInternships
        );


        toast.success(
          "Internship posted successfully!"
        );


        /*
         * Reset form
         */
        setForm({
          title: "",

          companyname:
            admin?.companyname ||
            "",

          duration: "",

          location: "Remote",

          stipend: "",

          description: "",

          requirements: "",

          skills: "",
        });

      } catch (error) {

        console.error(
          "Error posting internship:",
          error
        );


        toast.error(
          "Error posting internship."
        );
      }
    };


  /* =========================================================
     OPEN DELETE CONFIRMATION
  ========================================================= */

  const handleDelete = (
    id
  ) => {

    setDeleteInternshipId(
      id
    );

    setShowDeleteModal(
      true
    );
  };


  /* =========================================================
     CONFIRM DELETE INTERNSHIP
  ========================================================= */

  const confirmDeleteInternship =
    async () => {

      if (
        !deleteInternshipId
      ) {
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
            `${API_BASE}/api/internships/delete/${deleteInternshipId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
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


        const text =
          await res.text();


        if (!res.ok) {

          toast.error(
            text ||
              "Unable to delete internship."
          );


          return;
        }


        /*
         * Remove from state
         */
        const updatedInternships =
          internships.filter(
            (item) =>
              item.id !==
              deleteInternshipId
          );


        setInternships(
          updatedInternships
        );


        /*
         * IMPORTANT:
         * Update page cache.
         */
        saveInternshipsCache(
          updatedInternships
        );


        /*
         * IMPORTANT:
         * Update dashboard cache.
         */
        updateDashboardInternshipCache(
          updatedInternships
        );


        toast.success(
          "Internship deleted successfully."
        );

      } catch (error) {

        console.error(
          "Delete error:",
          error
        );


        toast.error(
          "Error deleting internship."
        );

      } finally {

        setShowDeleteModal(
          false
        );

        setDeleteInternshipId(
          null
        );
      }
    };


  /* =========================================================
     CANCEL DELETE
  ========================================================= */

  const cancelDelete = () => {

    setShowDeleteModal(
      false
    );

    setDeleteInternshipId(
      null
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
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/admin-dashboard"
                )
              }
            />


            {/* Post Internship */}

            <NavButton
              active
              icon={FileText}
              label="Post Internship"
              onClick={() =>
                navigate(
                  "/post-internship"
                )
              }
            />


            {/* Applications */}

            <NavButton
              icon={Users}
              label="Applications"
              onClick={() =>
                navigate(
                  "/applications"
                )
              }
            />


            {/* Track Progress */}

            <NavButton
              icon={TrendingUp}
              label="Track Progress"
              onClick={() =>
                navigate(
                  "/track-progress"
                )
              }
            />


            {/* Evaluations */}

            <NavButton
              icon={ClipboardCheck}
              label="Evaluations"
              onClick={() =>
                navigate(
                  "/evaluations"
                )
              }
            />


            {/* Profile */}

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
                  PAGE HEADER
              ============================================= */}

              <div className="sd-header-section">

                <h1>
                  Post New Internship
                </h1>


                <p>
                  Create a new internship
                  opportunity for students.
                </p>

              </div>


              {/* =============================================
                  FORM CARD
              ============================================= */}

              <section className="post-form-card">

                <h2>
                  Internship Details
                </h2>


                <form
                  onSubmit={
                    handleSubmit
                  }
                >


                  {/* Title */}

                  <div className="form-group">

                    <label htmlFor="title">
                      Internship Title
                    </label>


                    <input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Enter internship title"
                      value={
                        form.title
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* Duration + Location */}

                  <div className="form-grid">


                    <div className="form-group">

                      <label htmlFor="duration">
                        Duration
                      </label>


                      <select
                        id="duration"
                        name="duration"
                        value={
                          form.duration
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="">
                          Select duration
                        </option>


                        <option value="1 Month">
                          1 Month
                        </option>


                        <option value="3 Months">
                          3 Months
                        </option>


                        <option value="6 Months">
                          6 Months
                        </option>

                      </select>

                    </div>


                    <div className="form-group">

                      <label htmlFor="location">
                        Location
                      </label>


                      <select
                        id="location"
                        name="location"
                        value={
                          form.location
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="Remote">
                          Remote
                        </option>


                        <option value="Onsite">
                          Onsite
                        </option>


                        <option value="Hybrid">
                          Hybrid
                        </option>

                      </select>

                    </div>

                  </div>


                  {/* Stipend */}

                  <div className="form-group">

                    <label htmlFor="stipend">
                      Monthly Stipend
                    </label>


                    <input
                      id="stipend"
                      name="stipend"
                      type="text"
                      placeholder="Example: ₹10,000"
                      value={
                        form.stipend
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* Description */}

                  <div className="form-group">

                    <label htmlFor="description">
                      Description
                    </label>


                    <textarea
                      id="description"
                      name="description"
                      placeholder="Describe the internship..."
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* Requirements */}

                  <div className="form-group">

                    <label htmlFor="requirements">
                      Requirements
                    </label>


                    <textarea
                      id="requirements"
                      name="requirements"
                      placeholder="Enter internship requirements..."
                      value={
                        form.requirements
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* Skills */}

                  <div className="form-group">

                    <label htmlFor="skills">
                      Skills
                    </label>


                    <input
                      id="skills"
                      name="skills"
                      type="text"
                      placeholder="Java, React, Python..."
                      value={
                        form.skills
                      }
                      onChange={
                        handleChange
                      }
                    />


                    <small>
                      Separate skills with
                      commas.
                    </small>

                  </div>


                  {/* Buttons */}

                  <div className="form-actions">


                    <button
                      type="submit"
                      className="post-submit-btn"
                    >

                      <FileText
                        size={18}
                      />


                      Post Internship

                    </button>


                    <button
                      type="button"
                      className="post-cancel-btn"
                      onClick={() =>
                        navigate(
                          "/admin-dashboard"
                        )
                      }
                    >

                      Cancel

                    </button>

                  </div>

                </form>

              </section>


              {/* =============================================
                  POSTED INTERNSHIPS
              ============================================= */}

              <section className="sd-card">

                <h2>
                  Posted Internships
                </h2>


                {internships.length ===
                0 ? (

                  <div className="post-empty">

                    <FileText
                      size={40}
                    />


                    <h3>
                      No internships posted
                    </h3>


                    <p>
                      Your posted internships
                      will appear here.
                    </p>

                  </div>

                ) : (

                  internships.map(
                    (item) => (

                      <div
                        key={
                          item.id
                        }
                        className="posted-internship-card"
                      >

                        <div className="posted-internship-info">

                          <h3>
                            {
                              item.title
                            }
                          </h3>


                          <div className="internship-meta">

                            <span>

                              <strong>
                                Duration:
                              </strong>{" "}

                              {
                                item.duration ||
                                "N/A"
                              }

                            </span>


                            <span>

                              <strong>
                                Location:
                              </strong>{" "}

                              {
                                item.location ||
                                "N/A"
                              }

                            </span>


                            <span>

                              <strong>
                                Stipend:
                              </strong>{" "}

                              {
                                item.stipend ||
                                "Not specified"
                              }

                            </span>

                          </div>


                          {item.description && (

                            <p>
                              {
                                item.description
                              }
                            </p>

                          )}

                        </div>


                        <button
                          type="button"
                          className="post-delete-btn"
                          onClick={() =>
                            handleDelete(
                              item.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    )
                  )

                )}

              </section>

            </>

          )}

        </main>

      </div>


      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {showDeleteModal && (

        <div
          className="modal-overlay"
          onClick={
            cancelDelete
          }
        >

          <div
            className="modal-container"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <h3>
              Delete Internship?
            </h3>


            <p
              style={{
                marginTop:
                  "10px",

                marginBottom:
                  "20px",
              }}
            >

              Are you sure you want to
              delete this internship?

              <br />

              This action cannot be
              undone.

            </p>


            <div className="modal-actions">


              <button
                type="button"
                className="cancel-btn"
                onClick={
                  cancelDelete
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="delete-btn"
                onClick={
                  confirmDeleteInternship
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


/* =========================================================
   NAV BUTTON
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
        active
          ? "active"
          : ""
      }`}
      onClick={onClick}
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
}


export default Postinternship;