const express = require("express");
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("admin"), createItem);
router.get("/", authMiddleware, roleMiddleware("user", "admin"), getItems);
router.get("/:id", authMiddleware, roleMiddleware("user", "admin"), getItemById);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateItem);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteItem);

module.exports = router;        
