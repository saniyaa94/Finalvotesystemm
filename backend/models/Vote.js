const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    castAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// A voter may cast only ONE vote per election - enforced at the DB level
voteSchema.index({ voter: 1, election: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
