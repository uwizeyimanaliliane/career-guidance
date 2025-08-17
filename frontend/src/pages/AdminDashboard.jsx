import { useQuery } from 'react-query'
import { metricsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar, TrendingUp, Activity } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: dashboard, isLoading } = useQuery(
    'dashboard',
    () => metricsAPI.getDashboard().then(res => res.data)
  )

  if (isLoading) {
    return <div className="text-center py-4">Loading dashboard...</div>
  }

  const stats = [
    {
      name: 'Total Students',
      value: dashboard?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Active students',
    },
    {
      name: 'Total Sessions',
      value: dashboard?.totalSessions || 0,
      icon: Calendar,
      color: 'bg-green-500',
      description: 'All sessions recorded',
    },
    {
      name: 'Active Counselors',
      value: dashboard?.activeCounselors || 0,
      icon: Activity,
      color: 'bg-purple-500',
      description: 'Currently active staff',
    },
    {
      name: 'Completion Rate',
      value: dashboard?.completionRate || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      suffix: '%',
      description: 'Session completion',
    },
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.full_name || 'Admin'}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-700"
          >
            <div className="flex items-center space-x-4">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{stat.name}</h3>
                <p className="text-2xl font-bold text-green-700">
                  {stat.value}{stat.suffix || ''}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Career Interest */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Students by Career Interest
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard?.studentsByInterest || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="interest" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions by Counselor */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Sessions by Counselor
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboard?.sessionsByCounselor || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(dashboard?.sessionsByCounselor || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <ul className="divide-y divide-gray-200">
            {(dashboard?.recentActivity || []).map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/students/new')}
              className="w-full text-left px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition"
            >
              Add New Student
            </button>
            <button
              onClick={() => navigate('/staff/new')}
              className="w-full text-left px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition"
            >
              Add New Staff
            </button>
            <button
              onClick={() => navigate('/sessions/new')}
              className="w-full text-left px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition"
            >
              Schedule Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
