import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isLoggedIn = !!user;

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  return (
    <div className="nav">
      <div className="nav-inner">
        <div className="nav-left">
          <div className="brand">Job Tracker</div>
        </div>

        <div className="nav-center">
          {isLoggedIn ? (
            <>
              <NavLink className="nav-btn" to="/dashboard">
                Dashboard
              </NavLink>
              <NavLink className="nav-btn" to="/applications">
                Applications
              </NavLink>
              <button className="nav-btn solid" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink className="nav-btn solid" to="/auth">
              Login
            </NavLink>
          )}
        </div>

        <div className="nav-right">
          {isLoggedIn ? (
            <div className="nav-user" title={user.email}>
              <span className="dot" />
              <span className="nav-user-text">
                Logged in as <b>{user.name || "User"}</b>
                {user.email ? <span className="muted"> ({user.email})</span> : null}
              </span>
            </div>
          ) : (
            <div className="nav-user muted">Not logged in</div>
          )}
        </div>
      </div>
    </div>
  );
}
