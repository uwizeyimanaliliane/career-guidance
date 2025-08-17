import { Router } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../db.js';
import { sessionValidators } from '../utils/validators.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // staff + admin

// GET /api/sessions - Get all sessions (updated to include student and counselor names)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id,
             CONCAT(st.first_name, ' ', st.last_name) AS student_name,
             s.counselor_name,
             s.session_date,
             s.session_duration,
             s.notes
      FROM counseling_sessions s
      JOIN students st ON s.student_id = st.id
      ORDER BY s.session_date DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/:id - Get single session
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT cs.*, 
             CONCAT(s.first_name, ' ', s.last_name) as student_name
      FROM counseling_sessions cs
      JOIN students s ON cs.student_id = s.id
      WHERE cs.id = ?
    `, [req.params.id]);
    
    if (!rows[0]) return res.status(404).json({ message: 'Session not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/sessions - Create new session
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

    const [rows] = await pool.query(`
      SELECT cs.*, 
             CONCAT(s.first_name, ' ', s.last_name) as student_name
      FROM counseling_sessions cs
      JOIN students s ON cs.student_id = s.id
      WHERE cs.id = ?
    `, [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/sessions/:id - Update session
router.put('/:id', sessionValidators.update, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { student_id, counselor_name, session_date, notes, session_duration } = req.body;
    
    const [s] = await pool.query('SELECT id FROM students WHERE id = ?', [student_id]);
    if (!s[0]) return res.status(404).json({ message: 'Student not found' });

    const [result] = await pool.query(
      'UPDATE counseling_sessions SET student_id = ?, counselor_name = ?, session_date = ?, notes = ?, session_duration = ?, updated_at = NOW() WHERE id = ?',
      [student_id, counselor_name, session_date, notes || null, session_duration || 45, req.params.id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Session not found' });
    
    const [rows] = await pool.query(`
      SELECT cs.*, 
             CONCAT(s.first_name, ' ', s.last_name) as student_name
      FROM counseling_sessions cs
      JOIN students s ON cs.student_id = s.id
      WHERE cs.id = ?
    `, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/sessions/:id - Delete session
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM counseling_sessions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (err) { next(err); }
});

// GET /api/sessions/students/:id - Get sessions for a specific student
router.get('/students/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT cs.*, 
             CONCAT(s.first_name, ' ', s.last_name) as student_name
      FROM counseling_sessions cs
      JOIN students s ON cs.student_id = s.id
      WHERE cs.student_id = ?
      ORDER BY cs.session_date DESC, cs.created_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
