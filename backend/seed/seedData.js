/**
 * Seed script - populates the database with sample users, elections,
 * candidates and a handful of votes so the app is usable immediately.
 *
 * Run with:  npm run seed   (from the backend/ folder)
 * WARNING: this wipes the users, elections, candidates and votes collections.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");

const run = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Election.deleteMany({}),
    Candidate.deleteMany({}),
    Vote.deleteMany({}),
  ]);

  console.log("Creating users...");
  const admin = await User.create({
    name: "Ava Admin",
    email: "admin@votesys.com",
    password: "Admin@123",
    role: "admin",
  });

  const voters = await User.create([
    { name: "Riya Sharma", email: "riya@votesys.com", password: "Voter@123", role: "voter" },
    { name: "Kabir Mehta", email: "kabir@votesys.com", password: "Voter@123", role: "voter" },
    { name: "Sana Iyer", email: "sana@votesys.com", password: "Voter@123", role: "voter" },
    { name: "Dev Patel", email: "dev@votesys.com", password: "Voter@123", role: "voter" },
    { name: "Meera Nair", email: "meera@votesys.com", password: "Voter@123", role: "voter" },
  ]);

  const candidateUsers = await User.create([
    { name: "Arjun Rao", email: "arjun.candidate@votesys.com", password: "Cand@123", role: "candidate" },
    { name: "Leela Krishnan", email: "leela.candidate@votesys.com", password: "Cand@123", role: "candidate" },
    { name: "Vikram Sethi", email: "vikram.candidate@votesys.com", password: "Cand@123", role: "candidate" },
  ]);

  console.log("Creating elections...");
  const now = Date.now();
  const ongoingElection = await Election.create({
    title: "Student Council President 2026",
    description: "Annual election for the Student Council President seat.",
    startDate: new Date(now - 1000 * 60 * 60 * 24), // started yesterday
    endDate: new Date(now + 1000 * 60 * 60 * 24 * 6), // ends in 6 days
    status: "ongoing",
    createdBy: admin._id,
  });

  const upcomingElection = await Election.create({
    title: "Sports Club Captain 2026",
    description: "Election for the Sports Club Captain.",
    startDate: new Date(now + 1000 * 60 * 60 * 24 * 3),
    endDate: new Date(now + 1000 * 60 * 60 * 24 * 10),
    status: "upcoming",
    createdBy: admin._id,
  });

  const completedElection = await Election.create({
    title: "Class Representative 2025",
    description: "Past election, kept for historical results.",
    startDate: new Date(now - 1000 * 60 * 60 * 24 * 30),
    endDate: new Date(now - 1000 * 60 * 60 * 24 * 23),
    status: "completed",
    createdBy: admin._id,
  });

  console.log("Creating candidates...");
  const [arjun, leela, vikram] = candidateUsers;

  const c1 = await Candidate.create({
    user: arjun._id,
    name: "Arjun Rao",
    party: "Progress Alliance",
    symbol: "🌟",
    bio: "Focused on campus infrastructure and student welfare.",
    election: ongoingElection._id,
  });
  const c2 = await Candidate.create({
    user: leela._id,
    name: "Leela Krishnan",
    party: "Unity Front",
    symbol: "🌿",
    bio: "Advocating for sustainability and inclusive events.",
    election: ongoingElection._id,
  });
  const c3 = await Candidate.create({
    name: "Rohan Das",
    party: "Independent",
    symbol: "🦅",
    bio: "Running independently on a transparency platform.",
    election: ongoingElection._id,
  });

  const c4 = await Candidate.create({
    user: vikram._id,
    name: "Vikram Sethi",
    party: "Sports United",
    symbol: "🏆",
    bio: "Former team captain, three-year athlete.",
    election: upcomingElection._id,
  });
  const c5 = await Candidate.create({
    name: "Priya Menon",
    party: "Active Life",
    symbol: "⚡",
    bio: "Pushing for better training facilities.",
    election: upcomingElection._id,
  });

  const c6 = await Candidate.create({
    name: "Karan Bose",
    party: "Voice of Class",
    symbol: "📣",
    bio: "Past representative, ran for a second term.",
    election: completedElection._id,
  });
  const c7 = await Candidate.create({
    name: "Anita Verma",
    party: "New Wave",
    symbol: "🌊",
    bio: "First-time candidate with a fresh agenda.",
    election: completedElection._id,
  });

  console.log("Casting sample votes...");
  const [riya, kabir, sana, dev, meera] = voters;

  // Votes for the ongoing election
  await Vote.create([
    { voter: riya._id, candidate: c1._id, election: ongoingElection._id },
    { voter: kabir._id, candidate: c1._id, election: ongoingElection._id },
    { voter: sana._id, candidate: c2._id, election: ongoingElection._id },
    { voter: dev._id, candidate: c3._id, election: ongoingElection._id },
  ]);

  // Votes for the completed election (historical results)
  await Vote.create([
    { voter: riya._id, candidate: c6._id, election: completedElection._id },
    { voter: kabir._id, candidate: c7._id, election: completedElection._id },
    { voter: sana._id, candidate: c6._id, election: completedElection._id },
    { voter: dev._id, candidate: c6._id, election: completedElection._id },
    { voter: meera._id, candidate: c7._id, election: completedElection._id },
  ]);

  console.log("\nSeed complete! Sample login credentials:");
  console.table([
    { role: "admin", email: "admin@votesys.com", password: "Admin@123" },
    { role: "voter", email: "riya@votesys.com", password: "Voter@123" },
    { role: "voter", email: "kabir@votesys.com", password: "Voter@123" },
    { role: "candidate", email: "arjun.candidate@votesys.com", password: "Cand@123" },
    { role: "candidate", email: "leela.candidate@votesys.com", password: "Cand@123" },
  ]);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
