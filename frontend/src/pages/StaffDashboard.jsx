import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    todaysSessions: 0,
    completedToday: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all students
      const studentsRes = await api.get('/students');
      // Fetch today's sessions
      const sessionsRes = await api.get('/sessions');
      const today = new Date().toISOString().slice(0, 10);

      const todaysSessions = sessionsRes.data.filter(
        s => s.session_date === today
      ).length;

      const completedToday = sessionsRes.data.filter(
        s => s.session_date === today && s.completed === true
      ).length;

      setStats({
        totalStudents: studentsRes.data.length,
        todaysSessions,
        completedToday,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.first_name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Students</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
          <p className="text-sm text-gray-500 mt-1">Students assigned to you</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Sessions</h3>
          <p className="text-3xl font-bold text-green-600">{stats.todaysSessions}</p>
          <p className="text-sm text-gray-500 mt-1">Sessions scheduled today</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Today</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.completedToday}</p>
          <p className="text-sm text-gray-500 mt-1">Sessions completed</p>
        </div>
      </div>

      {/* Schedule + Quick Actions */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/students')}
              className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition"
            >
              View Students
            </button>
            <button
              onClick={() => navigate('/sessions')}
              className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 transition"
            >
              Schedule New Session
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 transition"
            >
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
