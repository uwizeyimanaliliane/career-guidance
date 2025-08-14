import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let queryParams = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE cs.session_date BETWEEN ? AND ?';
      queryParams = [startDate, endDate];
    }

    // Get comprehensive analytics
    const [overview] = await pool.query(`
      SELECT 
        COUNT(DISTINCT s.id) as totalStudents,
        COUNT(DISTINCT cs.id) as totalSessions,
        COUNT(DISTINCT CASE WHEN cs.session_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN s.id END) as activeStudents,
        AVG(cs.session_duration) as avgSessionDuration,
        COUNT(DISTINCT cs.counselor_name) as totalCounselors,
        SUM(CASE WHEN cs.session_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as sessionsThisMonth
      FROM students s
      LEFT JOIN counseling_sessions cs ON s.id = cs.student_id
      ${dateFilter}
    `, queryParams);

    // Get monthly trends
    const [monthlyTrends] = await pool.query(`
      SELECT 
        DATE_FORMAT(cs.session_date, '%Y-%m') as month,
        COUNT(*) as sessions,
        COUNT(DISTINCT cs.student_id) as uniqueStudents,
        COUNT(DISTINCT cs.counselor_name) as uniqueCounselors
      FROM counseling_sessions cs
      ${dateFilter}
      GROUP BY DATE_FORMAT(cs.session_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, queryParams);

    // Get top students by session count
    const [topStudents] = await pool.query(`
      SELECT 
        s.id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        COUNT(cs.id) as session_count,
        MAX(cs.session_date) as last_session
      FROM students s
      LEFT JOIN counseling_sessions cs ON s.id = cs.student_id
      ${dateFilter}
      GROUP BY s.id, s.first_name, s.last_name
      ORDER BY session_count DESC
      LIMIT 10
    `, queryParams);

    // Get counselor performance
    const [counselorStats] = await pool.query(`
      SELECT 
        cs.counselor_name,
        COUNT(cs.id) as total_sessions,
        COUNT(DISTINCT cs.student_id) as unique_students,
        AVG(cs.session_duration) as avg_duration,
        SUM(CASE WHEN cs.session_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as recent_sessions
      FROM counseling_sessions cs
      ${dateFilter}
      GROUP BY cs.counselor_name
      ORDER BY total_sessions DESC
    `, queryParams);

    res.json({
      overview: overview[0],
      monthlyTrends,
      topStudents,
      counselorStats
    });
  } catch (err) {
    console.error('Error in /api/analytics/overview:', err);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      error: err.message
    });
  }
});

// GET /api/analytics/student-insights
router.get('/student-insights', async (req, res) => {
  try {
    const { studentId } = req.query;

    let studentFilter = '';
    let queryParams = [];

    if (studentId) {
      studentFilter = 'WHERE s.id = ?';
      queryParams.push(studentId);
    }

    const [studentInsights] = await pool.query(`
      SELECT 
        s.id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.grade_level,
        s.career_interest,
        COUNT(cs.id) as total_sessions,
        MIN(cs.session_date) as first_session,
        MAX(cs.session_date) as last_session,
        AVG(cs.session_duration) as avg_session_duration,
        COUNT(DISTINCT cs.counselor_name) as counselors_seen
      FROM students s
      LEFT JOIN counseling_sessions cs ON s.id = cs.student_id
      ${studentFilter}
      GROUP BY s.id, s.first_name, s.last_name, s.grade_level, s.career_interest
      ORDER BY total_sessions DESC
    `, queryParams);

    res.json(studentInsights);
  } catch (err) {
    console.error('Error in /api/analytics/student-insights:', err);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      error: err.message
    });
  }
});

export default router;
