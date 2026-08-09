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

const Postinternship = () => {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedAdmin =
    localStorage.getItem("adminProfile");

  const admin = storedAdmin
    ? JSON.parse(storedAdmin)
    : {};

  const employerId = admin?.id;

  const token =
    localStorage.getItem("token");


  /* =========================================================
     FORM
  ========================================================= */

  const [form, setForm] = useState({
    title: "",
    companyname: admin?.companyname || "",
    duration: "",
    location: "Remote",
    stipend: "",
    description: "",
    requirements: "",
    skills: "",
  });


  /* =========================================================
     LOAD INTERNSHIPS
  ========================================================= */

  useEffect(() => {
    if (!employerId) {
      setLoading(false);

      toast("Employer not found. Please login again.", {
        icon: "⚠️",
      });

      navigate("/login");

      return;
    }

    loadInternships();
  }, [employerId]);


  const loadInternships = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/internships/employer/${employerId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch internships"
        );
      }

      const data = await res.json();

      setInternships(
        Array.isArray(data)
          ? data
          : []
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
     INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =========================================================
     POST INTERNSHIP
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/internships?employerId=${employerId}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            ...form,
            companyname:
              admin.companyname || "",
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to post internship"
        );
      }

      const data = await res.json();

      setInternships((previous) => [
        data,
        ...previous,
      ]);

      toast.success(
        "Internship posted successfully!"
      );

      setForm({
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
     DELETE INTERNSHIP
  ========================================================= */

  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `https://remote-internship-30135.onrender.com/api/internships/delete/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const text =
        await res.text();

      if (!res.ok) {
        toast.error(
          text ||
            "Unable to delete internship."
        );

        return;
      }

      setInternships((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
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
    }
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
              active
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
                  onSubmit={handleSubmit}
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
                      value={form.title}
                      onChange={handleChange}
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
                        value={form.duration}
                        onChange={handleChange}
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
                        value={form.location}
                        onChange={handleChange}
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
                      value={form.stipend}
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      value={form.skills}
                      onChange={handleChange}
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
                        key={item.id}
                        className="posted-internship-card"
                      >

                        <div className="posted-internship-info">

                          <h3>
                            {item.title}
                          </h3>

                          <div className="internship-meta">

                            <span>
                              <strong>
                                Duration:
                              </strong>{" "}
                              {item.duration ||
                                "N/A"}
                            </span>

                            <span>
                              <strong>
                                Location:
                              </strong>{" "}
                              {item.location ||
                                "N/A"}
                            </span>

                            <span>
                              <strong>
                                Stipend:
                              </strong>{" "}
                              {item.stipend ||
                                "Not specified"}
                            </span>

                          </div>

                          {item.description && (
                            <p>
                              {item.description}
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


export default Postinternship;