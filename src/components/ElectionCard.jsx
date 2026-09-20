import React from "react";
import { Link } from "react-router-dom";

const statusLabel = {
  upcoming: "Upcoming",
  ongoing: "Polls Open",
  completed: "Closed",
  cancelled: "Cancelled",
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const ElectionCard = ({ election }) => {
  return (
    <div className="e-card">
      <div className="e-card__top">
        <span className={`tag tag--${election.status}`}>{statusLabel[election.status]}</span>
        <span className="e-card__count">{election.candidateCount ?? 0} candidates</span>
      </div>
      <h3 className="e-card__title">{election.title}</h3>
      {election.description && <p className="e-card__desc">{election.description}</p>}
      <div className="e-card__dates">
        {formatDate(election.startDate)} &ndash; {formatDate(election.endDate)}
      </div>
      <div className="e-card__actions">
        <Link to={`/elections/${election._id}`} className="btn btn--outline btn--sm">
          View ballot
        </Link>
        <Link to={`/results?election=${election._id}`} className="btn btn--ghost btn--sm">
          See results
        </Link>
      </div>
    </div>
  );
};

export default ElectionCard;
