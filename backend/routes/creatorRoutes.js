const express = require("express");
const router = express.Router();

const {
  createTask,
  getCreatorTasks,
  getCreatorPayments,
} = require("../controllers/creatorController");

// const authMiddleware = require("../middleware/authMiddleware");
const { protect, allow } = require("../middlewares/authMiddleware");
router.use(protect, allow('creator'));
router.post("/tasks", protect, createTask);
router.get("/tasks", protect, getCreatorTasks);
router.get("/payments", protect, getCreatorPayments);

module.exports = router;
