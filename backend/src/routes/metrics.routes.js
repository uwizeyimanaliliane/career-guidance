import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/metrics/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    // Get total counts from v_totals view
    const [totals] = await pool.query('SELECT * FROM v_totals');
    const totalsData = totals[0] || { total_students: 0, total_sessions: 0 };

    // Get sessions by counselor from v_sessions_by_counselor view
    const [sessionsByCounselor] = await pool.query(
      'SELECT counselor_name as name, sessions_count as value FROM v_sessions_by_counselor'
    );

    // Get students by career interest
    const [studentsByInterest] = await pool.query(
      `SELECT career_interest as interest, COUNT(*) as count 
       FROM students 
       WHERE career_interest IS NOT NULL 
       GROUP BY career_interest 
       ORDER BY count DESC`
    );

    // Get recent activity (last 5 sessions)
    const [recentActivity] = await pool.query(
      `SELECT cs.id, cs.session_date as date, 
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              cs.counselor_name,
              cs.notes as description
       FROM counseling_sessions cs
       JOIN students s ON cs.student_id = s.id
       ORDER BY cs.session_date DESC, cs.created_at DESC
       LIMIT 5`
    );

    res.json({
      totalStudents: totalsData.total_students || 0,
      totalSessions: totalsData.total_sessions || 0,
      activeCounselors: sessionsByCounselor.length || 0,
      completionRate: 85, // Placeholder - can be calculated from data
      studentsByInterest: studentsByInterest || [],
      sessionsByCounselor: sessionsByCounselor || [],
      recentActivity: recentActivity || []
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/sessions-by-counselor
router.get('/sessions-by-counselor', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT counselor_name as name, sessions_count as value FROM v_sessions_by_counselor'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/students-by-interest
router.get('/students-by-interest', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT career_interest as interest, COUNT(*) as count 
       FROM students 
       WHERE career_interest IS NOT NULL 
       GROUP BY career_interest 
       ORDER BY count DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
