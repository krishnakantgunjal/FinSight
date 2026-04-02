const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getTemplates, addTemplate, deleteTemplate } = require('../controllers/recurringController');

router.use(auth);

router.get('/', getTemplates);
router.post('/', addTemplate);
router.delete('/:id', deleteTemplate);

module.exports = router;
