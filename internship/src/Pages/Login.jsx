import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/loginbg.png";
import "../Styles/Loginstyling.css";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(location.state?.role || "student");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const storedRole = localStorage.getItem("role");

    if (isLoggedIn) {
      if (storedRole === "student") navigate("/student-dashboard");
      else if (storedRole === "admin") navigate("/admin-dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:1305/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Invalid credentials");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", role);

      if (role === "student") {
        const safeProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          university: data.university,
          stream: data.stream,
          branch: data.branch,
          joiningyear: data.joiningyear,
          graduatedyear: data.graduatedyear,
          phone: data.phone,
          skills: data.skills,
          links: data.links,
          resume: data.resume,
          image: null,
        };

        localStorage.setItem(
          "studentProfile",
          JSON.stringify(safeProfile)
        );

        toast.success("Login Successful");
        navigate("/student-dashboard");

      } else if (role === "admin") {
        localStorage.setItem(
          "adminProfile",
          JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            companyname: data.companyname,
          })
        );

        navigate("/admin-dashboard");
      }

    } catch (error) {
      toast.error("Backend Is not running");
    }
  };

  return (
    <div
      className="login-bg"
      style={{ backgroundImage: `url(${logo})` }}
    >
      <div className="login-card">

        <div className="role-switch">
          <button
            className={role === "student" ? "active" : ""}
            onClick={() => {
              setRole("student");
              setEmail("");
              setPassword("");
            }}
          >
            Student
          </button>

          <button
            className={role === "admin" ? "active" : ""}
            onClick={() => {
              setRole("admin");
              setEmail("");
              setPassword("");
            }}
          >
            Admin
          </button>
        </div>

        <h2>Login as {role === "student" ? "Student" : "Admin"}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="eye-icon"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="login-btn">
            LOGIN
          </button>
        </form>


        <Link to="/Forgetpass" className="forgot">
          Forgot Password?
        </Link>

        <div className="link-row">
          <Link to="/register" className="usealignleft">
            Don't have an account? Register
          </Link>

          <Link to="/" className="usealignright">
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;