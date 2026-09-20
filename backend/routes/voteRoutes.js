const express = require("express");
const router = express.Router();
const {
  castVote,
  getVoteHistory,
  getVoteStatus,
  getAllVotes,
} = require("../controllers/voteController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(protect);

router.post("/", authorize("voter"), castVote);
router.get("/history", getVoteHistory);
router.get("/status/:electionId", getVoteStatus);
router.get("/", authorize("admin"), getAllVotes);

module.exports = router;
