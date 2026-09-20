const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Election title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Virtual: is the election currently open for voting, based on dates + status
electionSchema.virtual("isOpen").get(function () {
  const now = new Date();
  return (
    this.status === "ongoing" && now >= this.startDate && now <= this.endDate
  );
});

electionSchema.set("toJSON", { virtuals: true });
electionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Election", electionSchema);
