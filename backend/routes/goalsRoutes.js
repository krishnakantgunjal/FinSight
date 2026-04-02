const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getGoals, addGoal, updateGoalAmount, deleteGoal } = require('../controllers/goalsController');

router.use(authMiddleware);

router.get('/', getGoals);
router.post('/', addGoal);
router.put('/:id/amount', updateGoalAmount);
router.delete('/:id', deleteGoal);

module.exports = router;
