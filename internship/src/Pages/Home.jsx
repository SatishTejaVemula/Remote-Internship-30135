import { motion } from "framer-motion";
import {
  Briefcase,
  ClipboardCheckIcon,
  ClipboardList,
  Database,
  MessageSquare,
  User,
  Zap,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../Styles/Homestyling.css";

const Home = () => {
  const features = [
    { title: "Post Internship Opportunities", description: "Create and manage detailed internship listings.", icon: <Briefcase size={38} />, link: "/pio" },
    { title: "Progress Report", description: "Track intern performance and task completion.", icon: <ClipboardCheckIcon size={38} />, link: "/progress" },
    { title: "Mentor Feedback", description: "Provide structured evaluation and insights.", icon: <MessageSquare size={38} />, link: "/mentor" },
    { title: "Profile Management", description: "Maintain records and internship history.", icon: <User size={38} />, link: "/profileinfo" },
    { title: "Apply & Track Tasks", description: "Apply for internships and manage assigned tasks.", icon: <ClipboardList size={38} />, link: "/tasks" },
    { title: "Centralized Management", description: "Control everything from one platform.", icon: <Database size={38} />, link: "/management" },
  ];

  return (
    <div className="home-wrapper">

      {/* ── HERO ── */}
      <section className="hero">
  
        <div className="floating-blob one" />
        <div className="floating-blob two" />
        <div className="floating-blob three" />

        <motion.div className="hero-badge" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          🚀 Next Generation Internship Platform
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}>
          Remote Internship <br />
          <span className="gradient-text">Management Platform</span>
        </motion.h1>

        <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
          Connect employers and students seamlessly. Track progress, manage tasks,
          and evaluate performance — all in one powerful platform.
        </motion.p>

        <motion.div className="hero-buttons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
          <Link to="/login" state={{ role: "student" }}>
            <button className="primary-btn">Start as Student</button>
          </Link>
          <Link to="/login" state={{ role: "admin" }}>
            <button className="secondary-btn">Employer Access</button>
          </Link>
        </motion.div>

        <motion.div className="hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
          {[["500+", "Companies"], ["12K+", "Students"], ["98%", "Satisfaction"]].map(([num, label]) => (
            <div key={label} className="stat-pill">
              <span className="stat-num">{num}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── WHY ── */}
      <section className="why" id="why">
        <motion.h2 className="section-title" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Why Choose <span className="gradient-text">InternHub?</span>
        </motion.h2>
        <p className="section-sub">Everything you need to manage successful remote internship programs</p>

        <div className="why-grid">
          {[
            { icon: <Zap size={26} />, color: "blue", title: "Real-Time Collaboration", desc: "Instant communication between mentors and interns." },
            { icon: <BarChart3 size={26} />, color: "purple", title: "Advanced Analytics", desc: "Track progress with structured performance insights." },
            { icon: <ShieldCheck size={26} />, color: "green", title: "Secure & Reliable", desc: "Enterprise-grade security with full data protection." },
          ].map(({ icon, color, title, desc }) => (
            <motion.div key={title} className="why-card" whileHover={{ y: -8 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className={`why-icon ${color}`}>{icon}</div>
              <p className="card-heading">{title}</p>
              <p className="card-body">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <motion.h2 className="section-title" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Platform <span className="gradient-text">Features</span>
        </motion.h2>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div key={i} className="feature-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }} viewport={{ once: true }} whileHover={{ y: -8 }}>
              <Link to={f.link} className="feature-link">
                <motion.div className="feature-icon" whileHover={{ rotate: 10, scale: 1.15 }}>{f.icon}</motion.div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
                <span className="feature-arrow">→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how" id="how">
        <motion.h2 className="section-title" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          How It <span className="gradient-text">Works</span>
        </motion.h2>
        <p className="section-sub">Simple, efficient process from application to completion</p>

        <div className="timeline">
          {[
            { n: "1", title: "Sign Up", desc: "Create your account and complete your profile." },
            { n: "2", title: "Connect", desc: "Employers post internships and students apply." },
            { n: "3", title: "Collaborate", desc: "Mentors assign tasks and monitor progress." },
            { n: "4", title: "Succeed", desc: "Complete internships and receive feedback." },
          ].map((step, i, arr) => (
            <div key={step.n} style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
              <motion.div className="timeline-step" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }}>
                <div className="circle">{step.n}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </motion.div>
              {i < arr.length - 1 && <div className="timeline-line" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <motion.div className="cta-box" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <h2>Ready to Transform Your Internship Experience?</h2>
          <p>Join thousands of students and companies already using InternHub.</p>
          <Link to="/register">
            <button className="primary-btn">Get Started Free</button>
          </Link>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;