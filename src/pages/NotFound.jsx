import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="page page--narrow" style={{ textAlign: "center" }}>
    <p className="eyebrow-plain">404</p>
    <h1>This page isn&rsquo;t on the ballot</h1>
    <p className="page__lede">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
    <Link to="/" className="btn btn--primary">
      Back home
    </Link>
  </div>
);

export default NotFound;
