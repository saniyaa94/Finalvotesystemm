import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({ voters: 0, candidates: 0, elections: 0, ongoing: 0 });
  const [electionCounts, setElectionCounts] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [usersRes, candidatesRes, electionsRes, countsRes] = await Promise.all([
          api.get("/users", { params: { role: "voter" } }),
          api.get("/candidates"),
          api.get("/elections"),
          api.get("/results/election-wise-count"),
        ]);

        setCounts({
          voters: usersRes.data.count,
          candidates: candidatesRes.data.count,
          elections: electionsRes.data.count,
          ongoing: electionsRes.data.elections.filter((e) => e.status === "ongoing").length,
        });
        setElectionCounts(countsRes.data.results);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading dashboard" />;

  return (
    <div className="page">
      <div className="page__head">
        <p className="eyebrow-plain">Administration</p>
        <h1>Dashboard</h1>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="stat-row">
        <StatCard label="Registered voters" value={counts.voters} />
        <StatCard label="Candidates" value={counts.candidates} />
        <StatCard label="Elections" value={counts.elections} />
        <StatCard label="Polls open now" value={counts.ongoing} />
      </div>

      <div className="quicklinks">
        <Link to="/admin/elections" className="quicklink">
          <span>Manage elections</span>
          <small>Create, edit, open or close a race</small>
        </Link>
        <Link to="/admin/candidates" className="quicklink">
          <span>Manage candidates</span>
          <small>Add or remove candidates per election</small>
        </Link>
        <Link to="/admin/voters" className="quicklink">
          <span>Manage voters &amp; accounts</span>
          <small>Search, edit roles, deactivate accounts</small>
        </Link>
      </div>

      <div className="panel">
        <h2 className="panel__title">Election-wise vote count</h2>
        {electionCounts.length === 0 ? (
          <div className="empty">No votes have been cast yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Election</th>
                <th>Status</th>
                <th>Votes cast</th>
              </tr>
            </thead>
            <tbody>
              {electionCounts.map((e) => (
                <tr key={e.electionId}>
                  <td>{e.title}</td>
                  <td>
                    <span className={`tag tag--${e.status}`}>{e.status}</span>
                  </td>
                  <td>{e.totalVotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
