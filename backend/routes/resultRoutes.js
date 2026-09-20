const express = require("express");
const router = express.Router();
const {
  votesPerCandidate,
  electionWinner,
  voterTurnout,
  electionWiseVoteCount,
  candidateRanking,
  electionSummary,
} = require("../controllers/resultController");
const { protect } = require("../middleware/auth");

router.use(protect);

// Aggregation 1
router.get("/election/:electionId/votes-per-candidate", votesPerCandidate);
// Aggregation 2
router.get("/election/:electionId/winner", electionWinner);
// Aggregation 3
router.get("/election/:electionId/turnout", voterTurnout);
// Aggregation 4
router.get("/election-wise-count", electionWiseVoteCount);
// Aggregation 5
router.get("/election/:electionId/ranking", candidateRanking);
// Combined dashboard summary (built on top of the aggregations above)
router.get("/election/:electionId/summary", electionSummary);

module.exports = router;
