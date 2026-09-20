import React from "react";

const StatCard = ({ label, value, hint }) => (
  <div className="stat">
    <div className="stat__value">{value}</div>
    <div className="stat__label">{label}</div>
    {hint && <div className="stat__hint">{hint}</div>}
  </div>
);

export default StatCard;
