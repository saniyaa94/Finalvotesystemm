import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ElectionCard from "../components/ElectionCard";
import Loader from "../components/Loader";

const STATUS_FILTERS = ["all", "ongoing", "upcoming", "completed"];

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchElections = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (status !== "all") params.status = status;
      if (search) params.search = search;
      const { data } = await api.get("/elections", { params });
      setElections(data.elections);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load elections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchElections, 250); // light debounce for search typing
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  return (
    <div className="page">
      <div className="page__head">
        <p className="eyebrow-plain">Every race, in one place</p>
        <h1>Elections</h1>
      </div>

      <div className="toolbar">
        <input
          className="toolbar__search"
          placeholder="Search elections by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="toolbar__filters">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`chip ${status === s ? "is-active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loader label="Fetching elections" />}
      {error && <div className="alert alert--error">{error}</div>}

      {!loading && !error && elections.length === 0 && (
        <div className="empty">No elections match that search.</div>
      )}

      <div className="grid grid--cards">
        {elections.map((e) => (
          <ElectionCard key={e._id} election={e} />
        ))}
      </div>
    </div>
  );
};

export default Elections;
