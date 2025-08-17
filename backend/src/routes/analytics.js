import express from "express"
import pool from "../db.js"

const router = express.Router()

// GET /analytics/overview
router.get("/overview", async (req, res) => {
  try {
    // 1. Totals
    const [studentsCount] = await pool.query(`SELECT COUNT(*) as total FROM students`)
    const [sessionsCount] = await pool.query(`SELECT COUNT(*) as total FROM sessions`)
    const [activeStudents] = await pool.query(
      `SELECT COUNT(DISTINCT student_id) as total FROM sessions`
    )

    // 2. Recent Sessions (last 5)
    const [recentSessions] = await pool.query(
      `SELECT s.id, s.student_id, s.counselor_name, s.session_date,
              st.first_name, st.last_name
       FROM sessions s
       JOIN students st ON st.id = s.student_id
       ORDER BY s.session_date DESC
       LIMIT 5`
    )
    const formattedRecent = recentSessions.map((r) => ({
      id: r.id,
      student_id: r.student_id,
      student_name: `${r.first_name} ${r.last_name}`,
      counselor_name: r.counselor_name,
      session_date: r.session_date,
    }))

    // 3. Monthly Trends (count of sessions per month)
    const [monthlyTrends] = await pool.query(
      `SELECT DATE_FORMAT(session_date, '%b %Y') as month, COUNT(*) as sessions
       FROM sessions
       GROUP BY DATE_FORMAT(session_date, '%Y-%m')
       ORDER BY MIN(session_date) ASC`
    )

    // 4. Students by Counselor
    const [studentsByCounselor] = await pool.query(
      `SELECT counselor_name as counselor, COUNT(DISTINCT student_id) as count
       FROM sessions
       GROUP BY counselor_name`
    )

    // 5. Top Students (by session count)
    const [topStudents] = await pool.query(
      `SELECT st.id, CONCAT(st.first_name, ' ', st.last_name) as name,
              COUNT(s.id) as sessionCount
       FROM sessions s
       JOIN students st ON st.id = s.student_id
       GROUP BY st.id
       ORDER BY sessionCount DESC
       LIMIT 5`
    )

    res.json({
      overview: {
        totalStudents: studentsCount[0].total,
        totalSessions: sessionsCount[0].total,
        activeStudents: activeStudents[0].total,
      },
      recentSessions: formattedRecent,
      monthlyTrends,
      studentsByCounselor,
      topStudents,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    res.status(500).json({ message: "Error fetching analytics" })
  }
})

export default router
