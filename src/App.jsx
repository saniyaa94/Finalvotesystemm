import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Elections from "./pages/Elections";
import ElectionDetail from "./pages/ElectionDetail";
import Results from "./pages/Results";
import VoteHistory from "./pages/VoteHistory";
import CandidateDashboard from "./pages/CandidateDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageElections from "./pages/ManageElections";
import ManageCandidates from "./pages/ManageCandidates";
import ManageVoters from "./pages/ManageVoters";
import NotFound from "./pages/NotFound";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      {!isAdminRoute && <Navbar />}
      <main className={isAdminRoute ? "" : "app-main"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/elections"
            element={
              <ProtectedRoute>
                <Elections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/elections/:id"
            element={
              <ProtectedRoute>
                <ElectionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vote-history"
            element={
              <ProtectedRoute roles={["voter"]}>
                <VoteHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/elections"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout>
                  <ManageElections />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout>
                  <ManageCandidates />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/voters"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout>
                  <ManageVoters />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && (
        <footer className="app-footer">
          <span>E-Voting &mdash; Online Voting System</span>
          <span>Built with the MERN stack</span>
        </footer>
      )}
    </div>
  );
}

export default App;
