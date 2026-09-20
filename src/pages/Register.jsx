import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/elections");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow-plain">Get registered</p>
        <h1 className="auth-card__title">Create your voter account</h1>
        <p className="auth-card__sub">
          You&rsquo;ll receive a unique voter ID and can cast one ballot per election.
        </p>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Full name</span>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
          </label>
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span>Phone (optional)</span>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="At least 6 characters"
            />
          </label>
          <button className="btn btn--primary btn--block" disabled={loading}>
            {loading ? "Creating account…" : "Register to vote"}
          </button>
        </form>

        <p className="auth-card__foot">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
