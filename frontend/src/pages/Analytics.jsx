  import { useState, useEffect } from 'react'
  import { useAuth } from '../hooks/useAuth'
  import api from '../services/api'
  import { format } from 'date-fns'
  import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
  } from 'recharts'

  const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#ef4444']

  const Analytics = () => {
    const { user } = useAuth()
    const [analytics, setAnalytics] = useState({
      totalStudents: 0,
      totalSessions: 0,
      activeStudents: 0,
      recentSessions: [],
      monthlyStats: [],
      studentsByCounselor: [],
      topStudents: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
      fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await api.get('/analytics/overview')
        const data = response.data

        setAnalytics({
          totalStudents: data.overview?.totalStudents || 0,
          totalSessions: data.overview?.totalSessions || 0,
          activeStudents: data.overview?.activeStudents || 0,
          recentSessions: data.recentSessions || [],
          monthlyStats: data.monthlyTrends || [],
          studentsByCounselor: data.studentsByCounselor || [],
          topStudents: data.topStudents || []
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching analytics')
      } finally {
        setLoading(false)
      }
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of student counseling metrics and trends
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total Students" value={analytics.totalStudents} color="blue" />
          <StatCard title="Total Sessions" value={analytics.totalSessions} color="green" />
          <StatCard title="Active Students" value={analytics.activeStudents} color="yellow" />
          <StatCard title="Monthly Growth" value="+12%" color="purple" />
        </div>

        {/* Students by Counselor Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Students by Counselor</h3>
          {analytics.studentsByCounselor.length === 0 ? (
            <p className="text-gray-500">No counselor data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.studentsByCounselor}
                  dataKey="count"
                  nameKey="counselor"
                  outerRadius={120}
                  fill="#8884d8"
                  label
                >
                  {analytics.studentsByCounselor.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Sessions Bar Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Sessions</h3>
          {analytics.monthlyStats.length === 0 ? (
            <p className="text-gray-500">No monthly stats available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Students */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Students</h3>
          {analytics.topStudents.length === 0 ? (
            <p className="text-gray-500">No top student data available</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {analytics.topStudents.map((student) => (
                <li key={student.id} className="py-3 flex justify-between">
                  <span className="font-medium">{student.name}</span>
                  <span className="text-sm text-gray-500">{student.sessionCount} sessions</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Sessions</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest counseling sessions across all students
            </p>
          </div>
          <div className="border-t border-gray-200">
            {analytics.recentSessions.length === 0 ? (
              <div className="px-4 py-5 sm:px-6">
                <p className="text-center text-gray-500">No recent sessions found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {analytics.recentSessions.map((session) => (
                  <li key={session.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {session.student_name || `Student ID: ${session.student_id}`}
                        </p>
                        <p className="text-sm text-gray-500">Counselor: {session.counselor_name}</p>
                        <p className="text-sm text-gray-500">
                          Date:{' '}
                          {session.session_date
                            ? format(new Date(session.session_date), 'MMM dd, yyyy')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, color }) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    }

    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${colors[color]} rounded-md flex items-center justify-center`}>
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="text-lg font-medium text-gray-900">{value}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    )
  }

  export default Analytics
