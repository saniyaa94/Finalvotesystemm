import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [candidacies, setCandidacies] = useState([]);
  const [standings, setStandings] = useState({}); // electionId -> ranking array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/candidates", { params: { user: user.id } });
        setCandidacies(data.candidates);

        const rankingEntries = await Promise.all(
          data.candidates.map(async (c) => {
            try {
              const r = await api.get(`/results/election/${c.election._id}/ranking`);
              return [c.election._id, r.data.ranking];
            } catch {
              return [c.election._id, []];
            }
          })
        );
        setStandings(Object.fromEntries(rankingEntries));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your campaign data.");
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  if (loading) return <Loader label="Loading your campaigns" />;

  return (
    <div className="page">
      <div className="page__head">
        <p className="eyebrow-plain">Candidate view</p>
        <h1>My campaign{candidacies.length !== 1 ? "s" : ""}</h1>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {!error && candidacies.length === 0 && (
        <div className="empty">
          You&rsquo;re not registered as a candidate in any election yet. Ask an admin to add
          you to a race.
        </div>
      )}

      {candidacies.map((c) => {
        const ranking = standings[c.election._id] || [];
        const mine = ranking.find((r) => r.candidateId === c._id);
        const totalVotes = ranking.reduce((sum, r) => sum + r.totalVotes, 0);

        return (
          <div className="panel" key={c._id}>
            <h2 className="panel__title">{c.election.title}</h2>
            <p className="panel__sub">
              Running as <strong>{c.name}</strong> &middot; {c.party} {c.symbol}
            </p>

            <div className="stat-row">
              <StatCard label="Current rank" value={mine ? `#${mine.rank}` : "—"} />
              <StatCard label="My votes" value={mine ? mine.totalVotes : 0} />
              <StatCard label="Total votes cast" value={totalVotes} />
              <StatCard label="Election status" value={c.election.status} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidateDashboard;
