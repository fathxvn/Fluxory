const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createBorrowRequest,
  getBorrowRequests,
  approveBorrowRequest,
  rejectBorrowRequest,  
  returnBorrowRequest,
} = require("../controllers/borrowRequestController");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("user", "admin"), createBorrowRequest);
router.get("/", authMiddleware, roleMiddleware("user", "admin"), getBorrowRequests);
router.put("/:id/approve", authMiddleware, roleMiddleware("admin"), approveBorrowRequest);
router.put("/:id/reject", authMiddleware, roleMiddleware("admin"), rejectBorrowRequest);
router.put("/:id/return", authMiddleware, roleMiddleware("admin"), returnBorrowRequest);

module.exports = router;
