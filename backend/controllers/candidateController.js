const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const Vote = require("../models/Vote");

// @route  GET /api/candidates?election=<id>&search=jane
// @access Private
const getCandidates = async (req, res) => {
  try {
    const { election, search, user } = req.query;
    const filter = {};
    if (election) filter.election = election;
    if (user) filter.user = user;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { party: { $regex: search, $options: "i" } },
      ];
    }
    const candidates = await Candidate.find(filter)
      .populate("election", "title status")
      .sort({ createdAt: -1 });
    res.json({ count: candidates.length, candidates });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidates", error: err.message });
  }
};

// @route  GET /api/candidates/:id
// @access Private
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate("election");
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    const voteCount = await Vote.countDocuments({ candidate: candidate._id });
    res.json({ candidate, voteCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidate", error: err.message });
  }
};

// @route  POST /api/candidates
// @access Private/Admin
const createCandidate = async (req, res) => {
  try {
    const { name, party, symbol, bio, election, user } = req.body;
    if (!name || !party || !election) {
      return res.status(400).json({ message: "Name, party and election are required" });
    }
    const electionExists = await Election.findById(election);
    if (!electionExists) return res.status(404).json({ message: "Election not found" });

    const candidate = await Candidate.create({ name, party, symbol, bio, election, user });
    res.status(201).json({ candidate });
  } catch (err) {
    res.status(500).json({ message: "Failed to create candidate", error: err.message });
  }
};

// @route  PUT /api/candidates/:id
// @access Private/Admin
const updateCandidate = async (req, res) => {
  try {
    const { name, party, symbol, bio, isApproved } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    if (name !== undefined) candidate.name = name;
    if (party !== undefined) candidate.party = party;
    if (symbol !== undefined) candidate.symbol = symbol;
    if (bio !== undefined) candidate.bio = bio;
    if (isApproved !== undefined) candidate.isApproved = isApproved;

    await candidate.save();
    res.json({ candidate });
  } catch (err) {
    res.status(500).json({ message: "Failed to update candidate", error: err.message });
  }
};

// @route  DELETE /api/candidates/:id
// @access Private/Admin
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await Vote.deleteMany({ candidate: candidate._id });
    await candidate.deleteOne();

    res.json({ message: "Candidate and their votes deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete candidate", error: err.message });
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
};
