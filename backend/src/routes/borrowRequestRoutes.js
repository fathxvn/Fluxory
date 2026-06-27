const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, (req, res) => {
  res.json({
    message: "Borrow request route works",
    body: req.body,
    user: req.user,
  });
});

module.exports = router;