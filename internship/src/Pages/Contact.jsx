import React from "react";

const Contact = () => {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        <h1 style={styles.title}>Get in Touch</h1>

        <p style={styles.subtitle}>
          We'd love to hear from you! Reach out for support, feedback, or queries.
        </p>

        <div style={styles.card}>
          <h2 style={styles.heading}>📬 Contact Information</h2>

          <p>
            📧 <strong>Email:</strong>{" "}
            <a href="mailto:internhub@gmail.com" style={styles.link}>
              internhub@gmail.com
            </a>
          </p>

          <p>
            📞 <strong>Phone:</strong>{" "}
            <a href="tel:+918555984554" style={styles.link}>
              +91 8555984554
            </a>
          </p>

          <p style={{ marginTop: "10px" }}>
            📍 <strong>Location:</strong><br />
            K L University<br />
            Vaddeswaram, Vijayawada<br />
            Andhra Pradesh, India
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>📝 Send a Message</h2>

          <form style={styles.form}>
            <input type="text" placeholder="Your Name" style={styles.input} />
            <input type="email" placeholder="Your Email" style={styles.input} />
            <textarea
              placeholder="Your Message"
              rows="4"
              style={styles.textarea}
            ></textarea>

            <button type="submit" style={styles.button}>
              Send Message
            </button>
          </form>
        </div>

        <p style={styles.note}>We usually respond within 24 hours 🚀</p>

        <a
            href="/"
            style={{
              display: "block",
              marginTop: "30px",
              textAlign: "center",
              background: "linear-gradient(90deg,#2563eb,#7c3aed)",
              padding: "12px",
              borderRadius: "10px",
              color: "white",
              textDecoration: "none",
              transition: "0.3s",
            }}
          >
            ⬅ Back to Home
          </a>

      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020617, #1e293b, #0f172a)",
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "800px",
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: "18px",
    padding: "40px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
    color: "white",
  },

  title: {
    textAlign: "center",
    fontSize: "32px",
    background: "linear-gradient(90deg,#38bdf8,#7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
  },

  subtitle: {
    textAlign: "center",
    opacity: 0.85,
    marginBottom: "25px",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
    lineHeight: "1.6",
  },

  heading: {
    color: "#a5b4fc",
    marginBottom: "12px",
    fontSize: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },

  textarea: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    resize: "none",
  },

  button: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg,#2563eb,#7c3aed)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },

  link: {
    color: "#38bdf8",
    textDecoration: "none",
  },

  note: {
    textAlign: "center",
    marginTop: "20px",
    opacity: 0.7,
  },
};

export default Contact;