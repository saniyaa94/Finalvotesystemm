const express = require("express");
const router = express.Router();
const {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
} = require("../controllers/electionController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(protect);

router.route("/")
  .get(getElections)
  .post(authorize("admin"), createElection);

router.route("/:id")
  .get(getElectionById)
  .put(authorize("admin"), updateElection)
  .delete(authorize("admin"), deleteElection);

module.exports = router;
