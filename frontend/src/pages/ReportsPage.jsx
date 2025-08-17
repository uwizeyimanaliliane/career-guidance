import { useState, useEffect } from 'react';
import api from '../services/api';

function ReportsPage() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Fetch students
      const studentsRes = await api.get('/students');
      setStudents(studentsRes.data);

      // Fetch sessions
      const sessionsRes = await api.get('/sessions');
      setSessions(sessionsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading reports...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      {/* Students Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Students</h2>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Career Interest</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="border px-4 py-2">{student.id}</td>
                <td className="border px-4 py-2">{student.first_name} {student.last_name}</td>
                <td className="border px-4 py-2">{student.career_interest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sessions Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Sessions</h2>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Student</th>
              <th className="border px-4 py-2 text-left">Counselor</th>
              <th className="border px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td className="border px-4 py-2">{session.id}</td>
                <td className="border px-4 py-2">
                  {students.find(s => s.id === session.student_id)?.first_name} {students.find(s => s.id === session.student_id)?.last_name}
                </td>
                <td className="border px-4 py-2">{session.counselor_name}</td>
                <td className="border px-4 py-2">{new Date(session.session_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;
