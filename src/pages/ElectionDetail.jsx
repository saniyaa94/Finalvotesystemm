import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CandidateCard from "../components/CandidateCard";
import Loader from "../components/Loader";

const statusLabel = {
  upcoming: "Upcoming",
  ongoing: "Polls Open",
  completed: "Closed",
  cancelled: "Cancelled",
};

const ElectionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/elections/${id}`);
      setElection(data.election);
      setCandidates(data.candidates);

      if (user?.role === "voter") {
        const statusRes = await api.get(`/votes/status/${id}`);
        setHasVoted(statusRes.data.hasVoted);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load this election.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitVote = async () => {
    if (!selected) return;
    setSubmitting(true);
    setMessage("");
    setError("");
    try {
      await api.post("/votes", { candidateId: selected, electionId: id });
      setHasVoted(true);
      setMessage("Your vote has been recorded. Thank you for participating.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not cast your vote.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading ballot" />;
  if (error && !election) return <div className="alert alert--error">{error}</div>;
  if (!election) return null;

  const canVote = user?.role === "voter" && election.status === "ongoing";

  return (
    <div className="page page--narrow">
      <Link to="/elections" className="back-link">
        &larr; All elections
      </Link>

      <div className="page__head">
        <span className={`tag tag--${election.status}`}>{statusLabel[election.status]}</span>
        <h1>{election.title}</h1>
        {election.description && <p className="page__lede">{election.description}</p>}
      </div>

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {user?.role === "voter" && hasVoted && !message && (
        <div className="alert alert--info">
          You&rsquo;ve already cast your vote in this election.{" "}
          <Link to="/vote-history">View your ballots &rarr;</Link>
        </div>
      )}

      {user?.role !== "voter" && (
        <div className="alert alert--info">
          Only accounts with the voter role can cast a ballot here.
        </div>
      )}

      {election.status !== "ongoing" && (
        <div className="alert alert--info">
          This election is {election.status === "upcoming" ? "not open yet" : "closed"} for voting.
        </div>
      )}

      <div className="ballot">
        <div className="ballot__head">
          <span>Candidates</span>
          {canVote && !hasVoted && <span>Select one</span>}
        </div>

        {candidates.length === 0 && <div className="empty">No candidates have been added yet.</div>}

        {candidates.map((c, i) => (
          <CandidateCard
            key={c._id}
            candidate={c}
            index={i}
            selected={selected === c._id}
            disabled={!canVote || hasVoted}
            onSelect={canVote && !hasVoted ? setSelected : undefined}
          />
        ))}
      </div>

      {canVote && !hasVoted && candidates.length > 0 && (
        <button
          className="btn btn--primary btn--lg"
          disabled={!selected || submitting}
          onClick={submitVote}
        >
          {submitting ? "Casting vote…" : "Cast my vote"}
        </button>
      )}
    </div>
  );
};

export default ElectionDetail;
