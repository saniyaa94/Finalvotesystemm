import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import Modal from "../components/Modal";

const emptyForm = { name: "", email: "", password: "", role: "voter", phone: "" };

const ManageVoters = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (role) params.role = role;
      const { data } = await api.get("/users", { params });
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, phone: u.phone || "" });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await api.put(`/users/${editing._id}`, {
          name: form.name,
          phone: form.phone,
          role: form.role,
        });
      } else {
        await api.post("/users", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save account.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update account.");
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete account for "${u.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete account.");
    }
  };

  return (
    <div className="page">
      <div className="page__head page__head--row">
        <div>
          <p className="eyebrow-plain">Administration</p>
          <h1>Manage voters &amp; accounts</h1>
        </div>
        <button className="btn btn--primary" onClick={openCreate}>
          + New account
        </button>
      </div>

      <div className="toolbar">
        <input
          className="toolbar__search"
          placeholder="Search by name, email or voter ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="voter">Voter</option>
          <option value="candidate">Candidate</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {loading ? (
        <Loader />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Voter ID</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`tag tag--role-${u.role}`}>{u.role}</span>
                </td>
                <td>{u.voterId || "—"}</td>
                <td>
                  <button className="link-toggle" onClick={() => toggleActive(u)}>
                    {u.isActive ? "Active" : "Deactivated"}
                  </button>
                </td>
                <td className="table__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => openEdit(u)}>
                    Edit
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(u)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit account" : "New account"} onClose={() => setModalOpen(false)}>
          {formError && <div className="alert alert--error">{formError}</div>}
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Full name</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                required
                disabled={!!editing}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            {!editing && (
              <label className="field">
                <span>Temporary password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </label>
            )}
            <div className="field-row">
              <label className="field">
                <span>Role</span>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="voter">Voter</option>
                  <option value="candidate">Candidate</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="field">
                <span>Phone</span>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
            </div>
            <button className="btn btn--primary btn--block" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create account"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageVoters;
