const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");

// @route  GET /api/elections?status=ongoing&search=council
// @access Private
const getElections = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    const elections = await Election.find(filter).sort({ startDate: -1 });

    // attach candidate count for convenience
    const withCounts = await Promise.all(
      elections.map(async (e) => {
        const candidateCount = await Candidate.countDocuments({ election: e._id });
        return { ...e.toObject(), candidateCount };
      })
    );

    res.json({ count: withCounts.length, elections: withCounts });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch elections", error: err.message });
  }
};

// @route  GET /api/elections/:id
// @access Private
const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });
    const candidates = await Candidate.find({ election: election._id });
    res.json({ election, candidates });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch election", error: err.message });
  }
};

// @route  POST /api/elections
// @access Private/Admin
const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status } = req.body;
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: "Title, startDate and endDate are required" });
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "endDate must be after startDate" });
    }
    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
      status: status || "upcoming",
      createdBy: req.user._id,
    });
    res.status(201).json({ election });
  } catch (err) {
    res.status(500).json({ message: "Failed to create election", error: err.message });
  }
};

// @route  PUT /api/elections/:id
// @access Private/Admin
const updateElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status } = req.body;
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    if (title !== undefined) election.title = title;
    if (description !== undefined) election.description = description;
    if (startDate !== undefined) election.startDate = startDate;
    if (endDate !== undefined) election.endDate = endDate;
    if (status !== undefined) election.status = status;

    await election.save();
    res.json({ election });
  } catch (err) {
    res.status(500).json({ message: "Failed to update election", error: err.message });
  }
};

// @route  DELETE /api/elections/:id
// @access Private/Admin
const deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    // Clean up dependent candidates and votes so the DB stays consistent
    await Candidate.deleteMany({ election: election._id });
    await Vote.deleteMany({ election: election._id });
    await election.deleteOne();

    res.json({ message: "Election and its candidates/votes deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete election", error: err.message });
  }
};

module.exports = {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
};
