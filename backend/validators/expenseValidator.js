const { body } = require('express-validator');

exports.addExpenseRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isDate().withMessage('Valid date required')
    .custom(val => {
      if (new Date(val) > new Date()) throw new Error('Date cannot be in the future');
      return true;
    }),
  body('description').optional().isLength({ max: 255 }),
];
