import { useAuth } from '../hooks/useAuth'

function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.full_name || 'Admin'}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-green-700">1,234</p>
          <p className="text-sm text-gray-500 mt-1">Active students</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Staff</h3>
          <p className="text-3xl font-bold text-green-700">56</p>
          <p className="text-sm text-gray-500 mt-1">Active staff members</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sessions Today</h3>
          <p className="text-3xl font-bold text-green-700">24</p>
          <p className="text-sm text-gray-500 mt-1">Scheduled sessions</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
          <p className="text-3xl font-bold text-green-700">98%</p>
          <p className="text-sm text-gray-500 mt-1">System uptime</p>
        </div>
      </div>

      {/* Activity & Actions */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-700 rounded-full"></div>
              <p className="text-sm text-gray-600">New student registration completed</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-700 rounded-full"></div>
              <p className="text-sm text-gray-600">Staff member added to system</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-700 rounded-full"></div>
              <p className="text-sm text-gray-600">Session scheduled for tomorrow</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition">
              Add New Student
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition">
              Add New Staff
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition">
              Schedule Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
