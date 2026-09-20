import React from "react";

// Renders a simple horizontal bar chart from aggregation results.
// results: [{ candidateId, name, party, symbol, totalVotes }]
const ResultBar = ({ results, winnerId }) => {
  const max = Math.max(1, ...results.map((r) => r.totalVotes));

  return (
    <div className="resultbars">
      {results.map((r, i) => {
        const pct = Math.round((r.totalVotes / max) * 100);
        const isWinner = winnerId && r.candidateId === winnerId;
        return (
          <div className="resultbar" key={r.candidateId}>
            <div className="resultbar__label">
              <span className="resultbar__rank">{i + 1}</span>
              <span className="resultbar__symbol">{r.symbol}</span>
              <span className="resultbar__name">
                {r.name}
                {isWinner && <span className="pill pill--gold">Leading</span>}
              </span>
              <span className="resultbar__party">{r.party}</span>
              <span className="resultbar__votes">{r.totalVotes} votes</span>
            </div>
            <div className="resultbar__track">
              <div
                className={`resultbar__fill ${isWinner ? "resultbar__fill--winner" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultBar;
