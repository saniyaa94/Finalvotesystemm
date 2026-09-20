const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");

// @route  POST /api/votes
// @access Private/Voter
const castVote = async (req, res) => {
  try {
    const { candidateId, electionId } = req.body;
    if (!candidateId || !electionId) {
      return res.status(400).json({ message: "candidateId and electionId are required" });
    }

    if (req.user.role !== "voter") {
      return res.status(403).json({ message: "Only voters can cast votes" });
    }

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    const now = new Date();
    if (election.status !== "ongoing" || now < election.startDate || now > election.endDate) {
      return res.status(400).json({ message: "This election is not currently open for voting" });
    }

    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found in this election" });
    }

    // Guard check up front for a friendly message...
    const alreadyVoted = await Vote.findOne({ voter: req.user._id, election: electionId });
    if (alreadyVoted) {
      return res.status(409).json({ message: "You have already voted in this election" });
    }

    // ...and the unique index on (voter, election) is the hard guarantee
    // against a race condition producing a double vote.
    const vote = await Vote.create({
      voter: req.user._id,
      candidate: candidateId,
      election: electionId,
    });

    res.status(201).json({ message: "Vote cast successfully", vote });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already voted in this election" });
    }
    res.status(500).json({ message: "Failed to cast vote", error: err.message });
  }
};

// @route  GET /api/votes/history
// @access Private/Voter (own history) - admins can pass ?voter=<id>
const getVoteHistory = async (req, res) => {
  try {
    const voterId = req.user.role === "admin" && req.query.voter ? req.query.voter : req.user._id;

    const votes = await Vote.find({ voter: voterId })
      .populate("candidate", "name party symbol")
      .populate("election", "title status startDate endDate")
      .sort({ castAt: -1 });

    res.json({ count: votes.length, votes });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vote history", error: err.message });
  }
};

// @route  GET /api/votes/status/:electionId
// @access Private/Voter - has the current user already voted in this election?
const getVoteStatus = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      voter: req.user._id,
      election: req.params.electionId,
    });
    res.json({ hasVoted: !!vote, vote: vote || null });
  } catch (err) {
    res.status(500).json({ message: "Failed to check vote status", error: err.message });
  }
};

// @route  GET /api/votes
// @access Private/Admin - raw list with search/filter
const getAllVotes = async (req, res) => {
  try {
    const { election, candidate } = req.query;
    const filter = {};
    if (election) filter.election = election;
    if (candidate) filter.candidate = candidate;

    const votes = await Vote.find(filter)
      .populate("voter", "name email voterId")
      .populate("candidate", "name party")
      .populate("election", "title")
      .sort({ castAt: -1 });

    res.json({ count: votes.length, votes });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch votes", error: err.message });
  }
};

module.exports = { castVote, getVoteHistory, getVoteStatus, getAllVotes };
