import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "candidate") return <Navigate to="/candidate" replace />;
    return <Navigate to="/elections" replace />;
  }

  return (
    <div className="hero">
      <div className="hero__content">
        <p className="eyebrow-plain">A full stack online voting system</p>
        <h1 className="hero__title">
          Every voice, <em>counted</em>.
        </h1>
        <p className="hero__lede">
          Register, review the candidates, and cast a single verified vote per election.
          Results are tallied live from the ballot box straight to the results desk.
        </p>
        <div className="hero__actions">
          <Link to="/register" className="btn btn--primary btn--lg">
            Register to vote
          </Link>
          <Link to="/login" className="btn btn--outline btn--lg">
            Sign in
          </Link>
        </div>
      </div>

      <div className="hero__panel" aria-hidden="true">
        <div className="hero__ballot">
          <div className="hero__ballot-head">Sample Ballot</div>
          <div className="hero__ballot-line">
            <span>01</span> Arjun Rao — Progress Alliance
          </div>
          <div className="hero__ballot-line hero__ballot-line--marked">
            <span>02</span> Leela Krishnan — Unity Front
          </div>
          <div className="hero__ballot-line">
            <span>03</span> Rohan Das — Independent
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
