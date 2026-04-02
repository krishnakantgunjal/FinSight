const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getExpenses, getCategories, addExpense, updateExpense, deleteExpense } = require("../controllers/expenseController");

const validate = require('../middleware/validate');
const { addExpenseRules } = require('../validators/expenseValidator');
const upload = require('../middleware/upload');
const { previewImport, confirmImport } = require('../controllers/importController');

router.use(authMiddleware);

router.post("/import/preview", upload.single("file"), previewImport);
router.post("/import/confirm", confirmImport);

router.get("/", getExpenses);
router.get("/categories", getCategories);
router.post("/", addExpenseRules, validate, addExpense);
router.put("/:id", addExpenseRules, validate, updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;

