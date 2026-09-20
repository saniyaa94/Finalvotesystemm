import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import Modal from "../components/Modal";

const emptyForm = { title: "", description: "", startDate: "", endDate: "", status: "upcoming" };

const toInputDate = (d) => new Date(d).toISOString().slice(0, 16);

const ManageElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/elections", { params: search ? { search } : {} });
      setElections(data.elections);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load elections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (e) => {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description || "",
      startDate: toInputDate(e.startDate),
      endDate: toInputDate(e.endDate),
      status: e.status,
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
        await api.put(`/elections/${editing._id}`, form);
      } else {
        await api.post("/elections", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save election.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    if (!window.confirm(`Delete "${e.title}"? This also removes its candidates and votes.`)) return;
    try {
      await api.delete(`/elections/${e._id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete election.");
    }
  };

  return (
    <div className="page">
      <div className="page__head page__head--row">
        <div>
          <p className="eyebrow-plain">Administration</p>
          <h1>Manage elections</h1>
        </div>
        <button className="btn btn--primary" onClick={openCreate}>
          + New election
        </button>
      </div>

      <div className="toolbar">
        <input
          className="toolbar__search"
          placeholder="Search elections…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {loading ? (
        <Loader />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Starts</th>
              <th>Ends</th>
              <th>Candidates</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {elections.map((e) => (
              <tr key={e._id}>
                <td>{e.title}</td>
                <td>
                  <span className={`tag tag--${e.status}`}>{e.status}</span>
                </td>
                <td>{new Date(e.startDate).toLocaleString()}</td>
                <td>{new Date(e.endDate).toLocaleString()}</td>
                <td>{e.candidateCount}</td>
                <td className="table__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => openEdit(e)}>
                    Edit
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(e)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {elections.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No elections found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit election" : "New election"} onClose={() => setModalOpen(false)}>
          {formError && <div className="alert alert--error">{formError}</div>}
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Start date &amp; time</span>
                <input
                  type="datetime-local"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </label>
              <label className="field">
                <span>End date &amp; time</span>
                <input
                  type="datetime-local"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <span>Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <button className="btn btn--primary btn--block" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create election"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageElections;
