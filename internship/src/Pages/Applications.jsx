import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Headerfordash from "../Components/Headerfordash";
import Loader from "../Components/Loader";
import "../Styles/Applications.css";
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  ClipboardCheck,
  User,
} from "lucide-react";

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const loggedEmployer = JSON.parse(
      localStorage.getItem("adminProfile")
    );
    const employerId = loggedEmployer?.id || {};

    fetch(`http://localhost:1305/api/applications/employer/${employerId}`)
      .then((res) => res.json())
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setApplications([]);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:1305/api/applications/${id}/status?status=${newStatus}`,
        {
          method: "PUT",
        }
      );
      const updatedApp = await res.json();
      const updatedList = applications.map((app) =>
        app.id === id ? updatedApp : app
      );

      setApplications(updatedList);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
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

          <button className="active">
            <Users size={18} />
            Applications
          </button>

          <button onClick={() => navigate("/track-progress")}>
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
            <h1>Student Applications</h1>
            <p>Review internship applications.</p>
          </div>
          {loading ? (
            <Loader />
          ) : !Array.isArray(applications) || applications.length === 0 ? (
            <p>No applications yet.</p>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="application-card">
                <div>
                  <h3>{app.internship?.title}</h3>

                  <p><strong>Name:</strong> {app.fullName}</p>
                  <p><strong>Email:</strong> {app.email}</p>
                  <p><strong>University:</strong> {app.university}</p>
                  <p><strong>GPA:</strong> {app.gpa}</p>
                  <p><strong>Status:</strong> {app.status}</p>

                  {app.resumePath && (
                    <p>
                      <strong>Resume:</strong>{" "}
                      <a
                        href={`http://localhost:1305/${app.resumePath}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </p>
                  )}
                </div>

                <div className="app-right">
                  {(app.status === "PENDING" || !app.status) && (
                    <>
                      <button
                        className="quick-action primary"
                        onClick={() => updateStatus(app.id, "APPROVED")}
                      >
                        Approve
                      </button>

                      <button
                        className="quick-action secondary"
                        onClick={() => updateStatus(app.id, "REJECTED")}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {app.status === "APPROVED" && (
                    <div className="status-approved">
                      ✅ Approved
                    </div>
                  )}

                  {app.status === "REJECTED" && (
                    <div className="status-rejected">
                      ❌ Rejected
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </>
  );
};

export default Applications;