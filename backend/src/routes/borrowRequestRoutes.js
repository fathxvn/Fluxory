const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createBorrowRequest,
  getBorrowRequests,
  approveBorrowRequest,
} = require("../controllers/borrowRequestController");

const router = express.Router();

router.post("/", authMiddleware, createBorrowRequest);
router.get("/", authMiddleware, getBorrowRequests);
router.put("/:id/approve", authMiddleware, approveBorrowRequest);

module.exports = router;