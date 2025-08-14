import { Router } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../db.js';
import { studentValidators } from '../utils/validators.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// All student routes require auth
router.use(requireAuth);

// GET /api/students
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/students/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/students (admin only)
router.post('/', requireRole('admin'), studentValidators.create, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { first_name, last_name, career_interest } = req.body;
    const [result] = await pool.query(
      'INSERT INTO students (first_name, last_name, career_interest) VALUES (?, ?, ?)',
      [first_name, last_name, career_interest || null]
    );
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/students/:id (admin only)
router.put('/:id', requireRole('admin'), studentValidators.update, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { first_name, last_name, career_interest } = req.body;
    const [result] = await pool.query(
      `UPDATE students
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           career_interest = COALESCE(?, career_interest)
       WHERE id = ?`,
      [first_name ?? null, last_name ?? null, career_interest ?? null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/students/:id (admin only)
router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
