const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { setBudget, getBudgets } = require("../controllers/budgetController");

router.use(authMiddleware);

router.post("/", setBudget);
router.get("/", getBudgets);

module.exports = router;

