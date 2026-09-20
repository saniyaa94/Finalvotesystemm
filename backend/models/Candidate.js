const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // optional linked login account for the candidate
    },
    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    party: {
      type: String,
      required: [true, "Party / affiliation is required"],
      trim: true,
    },
    symbol: {
      type: String, // emoji or short symbol code used as the ballot icon
      default: "🗳️",
    },
    bio: {
      type: String,
      default: "",
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: [true, "Candidate must belong to an election"],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

candidateSchema.index({ election: 1, name: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);
