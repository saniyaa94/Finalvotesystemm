import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Vote,
  Users,
  UserRound,
  LogOut,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/elections", label: "Elections", icon: Vote },
  { to: "/admin/candidates", label: "Candidates", icon: UserRound },
  { to: "/admin/voters", label: "Voters & Accounts", icon: Users },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">EV</span>
          <span>E-Voting Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                "admin-nav-link" + (isActive ? " is-active" : "")
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <a href="/elections" className="admin-nav-link">
            <ExternalLink size={18} />
            <span>View public site</span>
          </a>
          <button className="admin-nav-link admin-nav-link--danger" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__title">Admin Panel</div>
          <div className="admin-topbar__user">
            <div className="admin-avatar">{user?.name?.[0]?.toUpperCase() || "A"}</div>
            <div className="admin-topbar__who">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
