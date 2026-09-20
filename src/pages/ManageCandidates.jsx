import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import Modal from "../components/Modal";

const emptyForm = { name: "", party: "", symbol: "🗳️", bio: "", election: "" };

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [electionFilter, setElectionFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadElections = async () => {
    const { data } = await api.get("/elections");
    setElections(data.elections);
  };

  const loadCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (electionFilter) params.election = electionFilter;
      const { data } = await api.get("/candidates", { params });
      setCandidates(data.candidates);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    const t = setTimeout(loadCandidates, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, electionFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, election: elections[0]?._id || "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      party: c.party,
      symbol: c.symbol,
      bio: c.bio || "",
      election: c.election?._id || c.election,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        const { election, ...editable } = form; // election can't move once created
        await api.put(`/candidates/${editing._id}`, editable);
      } else {
        await api.post("/candidates", form);
      }
      setModalOpen(false);
      loadCandidates();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save candidate.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Remove candidate "${c.name}"? Their votes will also be removed.`)) return;
    try {
      await api.delete(`/candidates/${c._id}`);
      loadCandidates();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete candidate.");
    }
  };

  return (
    <div className="page">
      <div className="page__head page__head--row">
        <div>
          <p className="eyebrow-plain">Administration</p>
          <h1>Manage candidates</h1>
        </div>
        <button className="btn btn--primary" onClick={openCreate} disabled={elections.length === 0}>
          + New candidate
        </button>
      </div>

      <div className="toolbar">
        <input
          className="toolbar__search"
          placeholder="Search by name or party…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select"
          value={electionFilter}
          onChange={(e) => setElectionFilter(e.target.value)}
        >
          <option value="">All elections</option>
          {elections.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {loading ? (
        <Loader />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Party</th>
              <th>Election</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c._id}>
                <td>
                  <span aria-hidden="true">{c.symbol}</span> {c.name}
                </td>
                <td>{c.party}</td>
                <td>{c.election?.title}</td>
                <td className="table__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => openEdit(c)}>
                    Edit
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(c)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">
                  No candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit candidate" : "New candidate"} onClose={() => setModalOpen(false)}>
          {formError && <div className="alert alert--error">{formError}</div>}
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Party / affiliation</span>
                <input
                  required
                  value={form.party}
                  onChange={(e) => setForm({ ...form, party: e.target.value })}
                />
              </label>
              <label className="field field--symbol">
                <span>Symbol</span>
                <input
                  value={form.symbol}
                  maxLength={4}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <span>Bio</span>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </label>
            <label className="field">
              <span>Election</span>
              <select
                required
                disabled={!!editing}
                value={form.election}
                onChange={(e) => setForm({ ...form, election: e.target.value })}
              >
                {elections.map((el) => (
                  <option key={el._id} value={el._id}>
                    {el.title}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn--primary btn--block" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add candidate"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageCandidates;
