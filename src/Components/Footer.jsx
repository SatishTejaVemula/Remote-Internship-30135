import {
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import "../Styles/Footerstyling.css";
import { Link } from "react-router-dom";
import logo from "../assets/header1.png";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">

        <div className="footer-brand">
          <img
                    src={logo}
                    alt="Remote Internship"
                    className="logo"
                    onClick={() => navigate("/")}
          />

          <h3>InternHub</h3>

          <p>
            Connect students and employers seamlessly.
            Manage internships, tasks, progress and
            evaluations from one platform.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Platform</h4>
            <Link onClick={() => navigate("/")}>Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div>
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 InternHub. All rights reserved.</p>

        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;