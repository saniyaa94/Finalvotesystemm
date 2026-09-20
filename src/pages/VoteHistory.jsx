import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const VoteHistory = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/votes/history");
        setVotes(data.votes);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your vote history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page page--narrow">
      <div className="page__head">
        <p className="eyebrow-plain">Your record</p>
        <h1>My ballots</h1>
      </div>

      {loading && <Loader label="Fetching your history" />}
      {error && <div className="alert alert--error">{error}</div>}

      {!loading && votes.length === 0 && (
        <div className="empty">You haven&rsquo;t cast any votes yet.</div>
      )}

      <div className="history-list">
        {votes.map((v) => (
          <div className="history-row" key={v._id}>
            <div>
              <div className="history-row__election">{v.election?.title || "Election removed"}</div>
              <div className="history-row__candidate">
                Voted for <strong>{v.candidate?.name}</strong> ({v.candidate?.party})
              </div>
            </div>
            <div className="history-row__date">{formatDate(v.castAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoteHistory;
