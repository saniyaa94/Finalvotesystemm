import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Vote, ShieldCheck } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [];
  if (user) {
    links.push({ to: "/elections", label: "Elections" });
    links.push({ to: "/results", label: "Results" });
    if (user.role === "voter") {
      links.push({ to: "/vote-history", label: "My Votes" });
    }
    if (user.role === "candidate") {
      links.push({ to: "/candidate", label: "My Campaign" });
    }
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">
            <Vote size={20} />
          </span>
          <span className="brand__word">E-Voting</span>
        </Link>

        <button
          className="topbar__toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`topbar__nav ${open ? "is-open" : ""}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => "topbar__link" + (isActive ? " is-active" : "")}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}

          {user?.role === "admin" && (
            <NavLink to="/admin" className="topbar__link topbar__link--admin" onClick={() => setOpen(false)}>
              <ShieldCheck size={15} />
              Admin Panel
            </NavLink>
          )}

          {user ? (
            <div className="topbar__user">
              <span className="topbar__who">
                {user.name}
                <em>{user.role}</em>
              </span>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <div className="topbar__user">
              <Link to="/login" className="btn btn--ghost btn--sm">
                Sign in
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
