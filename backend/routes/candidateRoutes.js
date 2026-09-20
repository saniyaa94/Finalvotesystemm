const express = require("express");
const router = express.Router();
const {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(protect);

router.route("/")
  .get(getCandidates)
  .post(authorize("admin"), createCandidate);

router.route("/:id")
  .get(getCandidateById)
  .put(authorize("admin"), updateCandidate)
  .delete(authorize("admin"), deleteCandidate);

module.exports = router;
