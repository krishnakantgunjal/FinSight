const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboardData, getComparison } = require("../controllers/dashboardController");
const { getAIAdvice } = require('../controllers/aiController');

router.use(authMiddleware);

router.get("/", getDashboardData);
router.get("/ai-advice", getAIAdvice);
router.get("/comparison", getComparison);

module.exports = router;


