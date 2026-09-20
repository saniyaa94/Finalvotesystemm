import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ResultBar from "../components/ResultBar";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";

const Results = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const electionId = searchParams.get("election") || "";

  const [elections, setElections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadElections = async () => {
      setLoadingList(true);
      try {
        const { data } = await api.get("/elections");
        setElections(data.elections);
        if (!electionId && data.elections.length > 0) {
          setSearchParams({ election: data.elections[0]._id });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load elections.");
      } finally {
        setLoadingList(false);
      }
    };
    loadElections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!electionId) return;
    const loadSummary = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/results/election/${electionId}/summary`);
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [electionId]);

  return (
    <div className="page">
      <div className="page__head">
        <p className="eyebrow-plain">Live tally</p>
        <h1>Results</h1>
      </div>

      {loadingList ? (
        <Loader label="Loading elections" />
      ) : (
        <div className="toolbar">
          <select
            className="select"
            value={electionId}
            onChange={(e) => setSearchParams({ election: e.target.value })}
          >
            {elections.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <div className="alert alert--error">{error}</div>}
      {loading && <Loader label="Tallying votes" />}

      {!loading && summary && (
        <>
          <div className="stat-row">
            <StatCard label="Votes cast" value={summary.totalVotesCast} />
            <StatCard label="Voters participated" value={summary.totalVoters} />
            <StatCard
              label="Leading candidate"
              value={summary.winner ? summary.winner.name : "—"}
              hint={summary.winner ? `${summary.winner.totalVotes} votes` : "No votes yet"}
            />
            <StatCard label="Status" value={summary.election.status} />
          </div>

          <div className="panel">
            <h2 className="panel__title">Vote share by candidate</h2>
            {summary.leaderboard.length === 0 ? (
              <div className="empty">No votes have been cast in this election yet.</div>
            ) : (
              <ResultBar
                results={summary.leaderboard}
                winnerId={summary.winner?.candidateId}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
