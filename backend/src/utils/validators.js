import { body, param } from 'express-validator';

export const studentValidators = {
  create: [
    body('first_name').isString().trim().notEmpty().withMessage('first_name is required'),
    body('last_name').isString().trim().notEmpty().withMessage('last_name is required'),
    body('career_interest').optional().isString().trim()
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
    body('first_name').optional().isString().trim().notEmpty(),
    body('last_name').optional().isString().trim().notEmpty(),
    body('career_interest').optional().isString().trim()
  ]
};

export const sessionValidators = {
  create: [
    body('student_id').isInt({ min: 1 }).withMessage('student_id must be a positive integer'),
    body('counselor_name').isString().trim().notEmpty().withMessage('counselor_name is required'),
    body('session_date').isISO8601().withMessage('session_date must be a valid date'),
    body('notes').optional().isString()
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
    body('student_id').optional().isInt({ min: 1 }).withMessage('student_id must be a positive integer'),
    body('counselor_name').optional().isString().trim().notEmpty(),
    body('session_date').optional().isISO8601().withMessage('session_date must be a valid date'),
    body('notes').optional().isString(),
    body('session_duration').optional().isInt({ min: 1 }).withMessage('session_duration must be a positive integer')
  ]
};

export const authValidators = {
  login: [
    body('email').isEmail().normalizeEmail().withMessage('valid email required'),
    body('password').isString().notEmpty().withMessage('password required')
  ],
  register: [
    body('email').isEmail().normalizeEmail().withMessage('valid email required'),
    body('password').isString().isLength({ min: 6 }).withMessage('password at least 6 chars'),
    body('full_name').optional().isString().trim(),
    body('role').optional().isIn(['admin', 'staff']).withMessage('role must be admin or staff')
  ]
};
