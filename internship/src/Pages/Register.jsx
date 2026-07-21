import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import backreg from "../assets/backreg.png";
import "../Styles/Loginstyling.css";
import toast from "react-hot-toast";

const Register = () => {
  const [role, setRole] = useState("Student");
  const [step, setStep] = useState(1);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    stream: "",
    branch: "",
    companyname: "",
    companyWebsite: "",
    industry: "",
    location: "",
    phone: "",
    gstNumber: "",
    linkedin: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      organization: "",
      stream: "",
      branch: "",
      joiningyear: "",
      graduatedyear: "",
      companyname: "",
      companyWebsite: "",
      industry: "",
      location: "",
      phone: "",
      gstNumber: "",
      linkedin: ""
    });
    setStep(1);
    setStrength("");
    setPasswordError("");
    setUserCaptcha("");
    setIsCaptchaValid(false);
  };

  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [strength, setStrength] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const generateCaptcha = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setCaptcha(random.toString());
    setUserCaptcha("");
    setIsCaptchaValid(false);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");
    if (isLoggedIn) {
      if (role === "student") navigate("/student-dashboard");
      else if (role === "admin") navigate("/admin-dashboard");
    }
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const isValid =
      userCaptcha.trim() === captcha &&
      formData.password === formData.confirmPassword &&
      formData.password.trim() !== "";
    setIsCaptchaValid(isValid);
  }, [userCaptcha, captcha, formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "organization" ? value.toUpperCase() : value,
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return "Weak";
    if (score === 3 || score === 4) return "Medium";
    return "Strong";
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast("Passwords do not match", {
        icon: "⚠️",
      });
      return;
    }
    if (!emailVerified) {
      toast.error("Please verify your email first");
      return;
    }
    if (!isCaptchaValid) {
      toast("Invalid Captcha!", {
        icon: "⚠️",
      });
      return;
    }
    try {
      let payload = {};
      if (role === "Student") {
        payload = {
          role: "student",
          name: formData.name,
          email: formData.email,
          password: formData.password,
          stream: formData.stream,
          branch: formData.branch,
          joiningyear: formData.joiningyear,
          graduatedyear: formData.graduatedyear,
          organization: formData.organization,
          verified: emailVerified
        };
      } else {
        payload = {
          role: "admin",
          empname: formData.name,
          companyname: formData.companyname,
          email: formData.email,
          password: formData.password,
          phonenumber: formData.phone,
          location: formData.location,
          companyWebsite: formData.companyWebsite,
          verified: emailVerified
        };
      }

      const response = await fetch(
        "https://remote-internship-30135.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.text();
      if (!response.ok) {
        toast.error(data || "Registration failed");
        return;
      }

      toast.success("Registration successful!");
      navigate("/login", { state: { role: role.toLowerCase() } });
    } catch (error) {
      toast("Server error. Make sure backend is running.", {
        icon: "⚠️",
      });
    }
  };
  const handleSendOtp = async () => {

    if (!formData.email) {
      toast.error("Enter Email");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(
        `https://remote-internship-30135.onrender.com/emailotp/send?email=${encodeURIComponent(formData.email)}`,
        {
          method: "POST"
        }
      );

      const msg = await res.text();

      if (!res.ok) {
        toast.error(msg);
        return;
      }

      toast.success("OTP Sent");

    } catch (e) {
      toast.error("Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async () => {

    if (!otp) {
      toast.error("Enter OTP");
      return;
    }

    try {

      const res = await fetch(
        `https://remote-internship-30135.onrender.com/emailotp/verify?email=${encodeURIComponent(formData.email)}&otp=${otp}`,
        {
          method: "POST"
        }
      );

      const msg = await res.text();

      if (
        msg.toLowerCase().includes("verified") ||
        msg.toLowerCase().includes("success")
      ) {

        setEmailVerified(true);

        toast.success("Email Verified");

      } else {

        toast.error(msg);

      }

    } catch (e) {

      toast.error("Verification failed");

    }
  };

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${backreg})` }}>
      <div className="login-card">

        <div className="role-switch">
          <button
            className={role === "Student" ? "active" : ""}
            onClick={() => { setRole("Student"); resetForm(); }}
          >
            Student
          </button>
          <button
            className={role === "Admin" ? "active" : ""}
            onClick={() => { setRole("Admin"); resetForm(); }}
          >
            Admin
          </button>
        </div>

        <h2>Register As {role}</h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              name="name"
              value={formData.name}
              placeholder="Full Name"
              onChange={handleChange}
            />
            <div className="email-verify-container">

              <input
                name="email"
                type="email"
                value={formData.email}
                placeholder="Email"
                onChange={handleChange}
                disabled={emailVerified}
              />

              {emailVerified ? (
                <span className="verified-badge">
                  ✓ Verified
                </span>
              ) : (
                <button
                  type="button"
                  className="verify-btn"
                  onClick={handleSendOtp}
                >
                  Verify
                </button>
              )}

            </div>
            {emailVerified ? (
              <button
                type="button"
                className="login-btn verify-email-btn"
                disabled
              >
                ✓ Verified
              </button>
            ) : (
              <button
                type="button"
                className="login-btn verify-email-btn"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "Sending..." : "Verify"}
              </button>
            )}

            {role === "Admin" && (
              <input
                name="phone"
                value={formData.phone}
                placeholder="Phone Number"
                onChange={handleChange}
              />
            )}
            {role === "Student" && (
              <input
                name="organization"
                value={formData.organization || ""}
                placeholder="Organization"
                onChange={handleChange}
              />
            )}

            <button
              onClick={nextStep}
              disabled={!formData.name || !formData.email}
              className="login-btn"
            >
              Next
            </button>

            <div className="link-row">
              <a href="/login" className="registerbut">Already have an account? Login</a>
              <a href="/" className="registerbut">Back to Home</a>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            {role === "Student" && (
              <>
                <input name="stream" value={formData.stream} placeholder="Stream" onChange={handleChange} />
                <input name="branch" value={formData.branch} placeholder="Branch" onChange={handleChange} />
                <label>Joining Year</label>
                <input type="date" name="joiningyear" value={formData.joiningyear} placeholder="Joining Year" onChange={handleChange} />
                <label>Graduation Year</label>
                <input type="date" name="graduatedyear" value={formData.graduatedyear} placeholder="Graduation Year" onChange={handleChange} />
              </>
            )}

            {role === "Admin" && (
              <>
                <input name="companyname" value={formData.companyname} placeholder="Company Name" onChange={handleChange} />
                <input name="companyWebsite" value={formData.companyWebsite} placeholder="Company Website" onChange={handleChange} />
                <input name="industry" value={formData.industry} placeholder="Industry" onChange={handleChange} />
                <input name="location" value={formData.location} placeholder="Location" onChange={handleChange} />
              </>
            )}

            <div className="link-row">
              <button onClick={prevStep} className="login-btn">Back</button>
              <button onClick={nextStep} className="login-btn">Next</button>
            </div>

            <div className="link-row">
              <a href="/login" className="registerbut">Already have an account? Login</a>
              <a href="/" className="registerbut">Back to Home</a>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="password-wrapper">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  handleChange(e);
                  setStrength(checkPasswordStrength(e.target.value));
                }}
              />
              <span onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {strength && (
              <p style={{ fontSize: "12px", color: strength === "Strong" ? "green" : strength === "Medium" ? "orange" : "red" }}>
                Password Strength: {strength}
              </p>
            )}

            <div className="password-wrapper">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="eye-icon">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="captcha-box">
              <span className="captcha-text">Captcha: {captcha}</span>
              <button className="refresh-btn" onClick={generateCaptcha}>Refresh</button>
            </div>

            <input
              placeholder="Enter Captcha"
              value={userCaptcha}
              onChange={(e) => setUserCaptcha(e.target.value)}
            />

            <div className="link-row">
              <button onClick={prevStep} className="login-btn">Back</button>
              <button disabled={!isCaptchaValid} onClick={handleRegister} className="login-btn">
                Register
              </button>
            </div>

            <div className="link-row">
              <a href="/login" className="registerbut">Already have an account? Login</a>
              <a href="/" className="registerbut">Back to Home</a>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Register;