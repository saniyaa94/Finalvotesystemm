import React from "react";

const Loader = ({ label = "Loading" }) => (
  <div className="loader">
    <span className="loader__mark" aria-hidden="true" />
    <span>{label}&hellip;</span>
  </div>
);

export default Loader;
