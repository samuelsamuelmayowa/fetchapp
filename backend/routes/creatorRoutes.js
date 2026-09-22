const express = require("express");
const router = express.Router();

const {
  createTask,
  getCreatorTasks,
  getCreatorPayments,
} = require("../controllers/creatorController");

// const authMiddleware = require("../middleware/authMiddleware");
const { protect } = require("../middlewares/authMiddleware");
router.post("/tasks", protect, createTask);
router.get("/tasks", protect, getCreatorTasks);
router.get("/payments", protect, getCreatorPayments);

module.exports = router;