import { useQuery } from 'react-query'
import { metricsAPI } from '../services/api'
import { Users, Calendar, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
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
    },
    {
      name: 'Total Sessions',
      value: dashboard?.totalSessions || 0,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      name: 'Active Counselors',
      value: dashboard?.activeCounselors || 0,
      icon: Activity,
      color: 'bg-purple-500',
    },
    {
      name: 'Completion Rate',
      value: dashboard?.completionRate || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      suffix: '%',
    },
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of career guidance activities and student progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}{stat.suffix || ''}
                      </div>
                    </dd>
                  </dl>
                </div>
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

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
          <div className="mt-4">
            <ul className="divide-y divide-gray-200">
              {(dashboard?.recentActivity || []).map((activity) => (
                <li key={activity.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{activity.title}</h3>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
