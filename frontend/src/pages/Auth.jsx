import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading, login, register } = useAuth();

  const [tab, setTab] = useState("login");


  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await login(loginEmail, loginPassword); 
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Check your details.");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
    
      await register(name, regEmail, regPassword);

      setSuccess("Registration successful. Please log in.");
      setTab("login");


      setName("");
      setRegEmail("");
      setRegPassword("");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Try again.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LEFT PANEL */}
        <div className="auth-left">
          <div className="auth-brand">Job Tracker</div>

          <h1 className="auth-title">
            Track your job applications.
            <br />
            Stay organized. Stay confident.
          </h1>

          <p className="auth-subtitle">
            Keep everything in one place. Add applications, update status, and see
            a clear dashboard of where you stand — without spreadsheets.
          </p>

          <ul className="auth-list">
            <li>✔ See application status at a glance</li>
            <li>✔ Update interviews, offers, and rejections easily</li>
          </ul>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => {
                setError("");
                setSuccess("");
                setTab("login");
              }}
              type="button"
            >
              Login
            </button>
            <button
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => {
                setError("");
                setSuccess("");
                setTab("register");
              }}
              type="button"
            >
              Register
            </button>
          </div>

          <div className="auth-formWrap">
            {tab === "login" ? (
              <>
                <h2 className="auth-heading">Welcome back</h2>
                <p className="auth-desc">
                  Log in to continue tracking your job applications.
                </p>

                {/* show success after registration */}
                {success && <div className="auth-success">{success}</div>}

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleLogin} className="auth-form">
                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />

                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />

                  <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? "Please wait..." : "Log in"}
                  </button>

                  <p className="auth-foot">
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      className="auth-link"
                      onClick={() => {
                        setError("");
                        setSuccess("");
                        setTab("register");
                      }}
                    >
                      Create one
                    </button>
                  </p>
                </form>
              </>
            ) : (
              <>
                <h2 className="auth-heading">Create your account</h2>
                <p className="auth-desc">
                  Create an account to start tracking your job applications.
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleRegister} className="auth-form">
                  <label className="auth-label">Name</label>
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />

                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />

                  <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? "Please wait..." : "Create account"}
                  </button>

                  <p className="auth-foot">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="auth-link"
                      onClick={() => {
                        setError("");
                        setSuccess("");
                        setTab("login");
                      }}
                    >
                      Log in
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
