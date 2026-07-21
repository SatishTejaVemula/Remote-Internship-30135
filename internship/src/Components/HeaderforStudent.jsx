import React, { useEffect, useState } from "react";
import { LogOut, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Styles/HeaderforStudent.css"

const HeaderforStudent = () => {
  const navigate = useNavigate();

  const storedStudent =
    JSON.parse(localStorage.getItem("studentProfile")) || {};

  const [student, setStudent] = useState(storedStudent);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
  if (!storedStudent?.id) return;

  const cached = localStorage.getItem("studentProfileFull");

  if (cached) {
    const parsed = JSON.parse(cached);
    setStudent(parsed);
    setImgLoading(false);
  }
  
  
    const token = localStorage.getItem("token");

  fetch(`https://remote-internship-30135.onrender.com/api/students/${storedStudent.id}`,{
 headers:{
  Authorization:`Bearer ${token}`
 }
}
)
    .then((res) => res.json())
    .then((data) => {
      setStudent(data);
      localStorage.setItem("studentProfileFull", JSON.stringify(data));
      setImgLoading(false);
    })
    .catch((err) => console.error(err));
}, [storedStudent?.id]);

  const handleLogout = () => {
    localStorage.removeItem("studentProfile");
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="dash-header">
      <div className="dash-left">
        <div className="logo-box">
          <GraduationCap size={18} />
        </div>
        <h2 className="logo-title" onClick={() => navigate("/student-dashboard")}>InternHub Student</h2>
      </div>

      <div className="dash-right">
        <div className="header-user-info">
          <a href="/student-profile" className="headerloname">
            <strong className="student-name">
              {student.name || "Student"}
            </strong>
          </a>

          <div
            onClick={() => navigate("/student-profile")}
            className="student-email"
          >
            {student.email || "student@gmail.com"}
          </div>
        </div>

        <div
          onClick={() => navigate("/student-profile")}
          style={{ cursor: "pointer" }}
        >
          {imgLoading && (
            <div className="avatar-skeleton"
            />
          )}

          <img
            key={student.image}
            loading="eager"
            src={
              student?.image
                ? student.image.startsWith("data:")
                  ? student.image
                  : `https://remote-internship-30135.onrender.com/api/students/image/${student.image}`
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile"
            onLoad={() => setImgLoading(false)}
            onError={(e) => {
              e.target.src =
                "https://remote-internship-30135.onrender.com/api/students/image/default";
              setImgLoading(false);
            }}
            className="profile-avatar"
          />
        </div>

        <button className="log-btun" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default HeaderforStudent;