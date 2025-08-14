import { Router } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../db.js';
import { sessionValidators } from '../utils/validators.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // staff + admin

// POST /api/sessions
router.post('/', sessionValidators.create, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { student_id, counselor_name, session_date, notes, session_duration } = req.body;

    const [s] = await pool.query('SELECT id FROM students WHERE id = ?', [student_id]);
    if (!s[0]) return res.status(404).json({ message: 'Student not found' });

    const [result] = await pool.query(
      'INSERT INTO counseling_sessions (student_id, counselor_name, session_date, notes, session_duration) VALUES (?, ?, ?, ?, ?)',
      [student_id, counselor_name, session_date, notes || null, session_duration || 45]
    );
    const [rows] = await pool.query('SELECT * FROM counseling_sessions WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/sessions/students/:id
router.get('/students/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM counseling_sessions WHERE student_id = ? ORDER BY session_date DESC, created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
