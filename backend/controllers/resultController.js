const mongoose = require("mongoose");
const Vote = require("../models/Vote");
const Election = require("../models/Election");

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// ---------------------------------------------------------------------
// AGGREGATION 1: Total votes per candidate (for one election)
// GET /api/results/election/:electionId/votes-per-candidate
// ---------------------------------------------------------------------
const votesPerCandidate = async (req, res) => {
  try {
    const { electionId } = req.params;

    const result = await Vote.aggregate([
      { $match: { election: toObjectId(electionId) } },
      {
        $group: {
          _id: "$candidate",
          totalVotes: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "candidates",
          localField: "_id",
          foreignField: "_id",
          as: "candidate",
        },
      },
      { $unwind: "$candidate" },
      {
        $project: {
          _id: 0,
          candidateId: "$candidate._id",
          name: "$candidate.name",
          party: "$candidate.party",
          symbol: "$candidate.symbol",
          totalVotes: 1,
        },
      },
      { $sort: { totalVotes: -1 } },
    ]);

    res.json({ electionId, results: result });
  } catch (err) {
    res.status(500).json({ message: "Aggregation failed", error: err.message });
  }
};

// ---------------------------------------------------------------------
// AGGREGATION 2: Winner of an election (highest vote count)
// GET /api/results/election/:electionId/winner
// ---------------------------------------------------------------------
const electionWinner = async (req, res) => {
  try {
    const { electionId } = req.params;

    const result = await Vote.aggregate([
      { $match: { election: toObjectId(electionId) } },
      { $group: { _id: "$candidate", totalVotes: { $sum: 1 } } },
      { $sort: { totalVotes: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "candidates",
          localField: "_id",
          foreignField: "_id",
          as: "candidate",
        },
      },
      { $unwind: "$candidate" },
      {
        $project: {
          _id: 0,
          candidateId: "$candidate._id",
          name: "$candidate.name",
          party: "$candidate.party",
          symbol: "$candidate.symbol",
          totalVotes: 1,
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({ electionId, winner: null, message: "No votes cast yet" });
    }
    res.json({ electionId, winner: result[0] });
  } catch (err) {
    res.status(500).json({ message: "Aggregation failed", error: err.message });
  }
};

// ---------------------------------------------------------------------
// AGGREGATION 3: Total distinct voters who participated in an election
// GET /api/results/election/:electionId/turnout
// ---------------------------------------------------------------------
const voterTurnout = async (req, res) => {
  try {
    const { electionId } = req.params;

    const result = await Vote.aggregate([
      { $match: { election: toObjectId(electionId) } },
      {
        $group: {
          _id: "$election",
          totalVoters: { $addToSet: "$voter" },
        },
      },
      {
        $project: {
          _id: 0,
          electionId: "$_id",
          totalVoters: { $size: "$totalVoters" },
        },
      },
    ]);

    res.json(result[0] || { electionId, totalVoters: 0 });
  } catch (err) {
    res.status(500).json({ message: "Aggregation failed", error: err.message });
  }
};

// ---------------------------------------------------------------------
// AGGREGATION 4: Election-wise vote count (across ALL elections)
// GET /api/results/election-wise-count
// ---------------------------------------------------------------------
const electionWiseVoteCount = async (req, res) => {
  try {
    const result = await Vote.aggregate([
      {
        $group: {
          _id: "$election",
          totalVotes: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "elections",
          localField: "_id",
          foreignField: "_id",
          as: "election",
        },
      },
      { $unwind: "$election" },
      {
        $project: {
          _id: 0,
          electionId: "$election._id",
          title: "$election.title",
          status: "$election.status",
          totalVotes: 1,
        },
      },
      { $sort: { totalVotes: -1 } },
    ]);

    res.json({ results: result });
  } catch (err) {
    res.status(500).json({ message: "Aggregation failed", error: err.message });
  }
};

// ---------------------------------------------------------------------
// AGGREGATION 5: Candidate ranking by votes (with dense rank) for an election
// GET /api/results/election/:electionId/ranking
// ---------------------------------------------------------------------
const candidateRanking = async (req, res) => {
  try {
    const { electionId } = req.params;

    const result = await Vote.aggregate([
      { $match: { election: toObjectId(electionId) } },
      { $group: { _id: "$candidate", totalVotes: { $sum: 1 } } },
      { $sort: { totalVotes: -1 } },
      {
        $lookup: {
          from: "candidates",
          localField: "_id",
          foreignField: "_id",
          as: "candidate",
        },
      },
      { $unwind: "$candidate" },
      {
        $group: {
          _id: null,
          rows: { $push: { candidateId: "$candidate._id", name: "$candidate.name", party: "$candidate.party", symbol: "$candidate.symbol", totalVotes: "$totalVotes" } },
        },
      },
      {
        $unwind: { path: "$rows", includeArrayIndex: "rank" },
      },
      {
        $project: {
          _id: 0,
          rank: { $add: ["$rank", 1] },
          candidateId: "$rows.candidateId",
          name: "$rows.name",
          party: "$rows.party",
          symbol: "$rows.symbol",
          totalVotes: "$rows.totalVotes",
        },
      },
    ]);

    res.json({ electionId, ranking: result });
  } catch (err) {
    res.status(500).json({ message: "Aggregation failed", error: err.message });
  }
};

// ---------------------------------------------------------------------
// BONUS: full dashboard summary combining several aggregations at once
// GET /api/results/election/:electionId/summary
// ---------------------------------------------------------------------
const electionSummary = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    const [votes, turnout] = await Promise.all([
      Vote.aggregate([
        { $match: { election: toObjectId(electionId) } },
        { $group: { _id: "$candidate", totalVotes: { $sum: 1 } } },
        {
          $lookup: {
            from: "candidates",
            localField: "_id",
            foreignField: "_id",
            as: "candidate",
          },
        },
        { $unwind: "$candidate" },
        {
          $project: {
            _id: 0,
            candidateId: "$candidate._id",
            name: "$candidate.name",
            party: "$candidate.party",
            symbol: "$candidate.symbol",
            totalVotes: 1,
          },
        },
        { $sort: { totalVotes: -1 } },
      ]),
      Vote.aggregate([
        { $match: { election: toObjectId(electionId) } },
        { $group: { _id: "$election", voters: { $addToSet: "$voter" } } },
        { $project: { _id: 0, totalVoters: { $size: "$voters" } } },
      ]),
    ]);

    const totalVotesCast = votes.reduce((sum, v) => sum + v.totalVotes, 0);

    res.json({
      election,
      totalVotesCast,
      totalVoters: turnout[0]?.totalVoters || 0,
      leaderboard: votes,
      winner: votes[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to build summary", error: err.message });
  }
};

module.exports = {
  votesPerCandidate,
  electionWinner,
  voterTurnout,
  electionWiseVoteCount,
  candidateRanking,
  electionSummary,
};
