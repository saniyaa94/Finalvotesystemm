import React from "react";

const CandidateCard = ({ candidate, index, selected, onSelect, disabled }) => {
  const selectable = typeof onSelect === "function";

  return (
    <div
      className={`ballot-line ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`}
      onClick={() => selectable && !disabled && onSelect(candidate._id)}
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
    >
      <span className="ballot-line__num">{String(index + 1).padStart(2, "0")}</span>
      <span className="ballot-line__symbol" aria-hidden="true">
        {candidate.symbol || "🗳️"}
      </span>
      <span className="ballot-line__info">
        <span className="ballot-line__name">{candidate.name}</span>
        <span className="ballot-line__party">{candidate.party}</span>
        {candidate.bio && <span className="ballot-line__bio">{candidate.bio}</span>}
      </span>
      {selectable && (
        <span className="ballot-line__radio" aria-hidden="true">
          {selected ? "●" : "○"}
        </span>
      )}
    </div>
  );
};

export default CandidateCard;
