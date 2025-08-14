import { useAuth } from '../hooks/useAuth'

function StaffDashboard() {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.full_name || 'Staff'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Students</h3>
          <p className="text-3xl font-bold text-blue-600">45</p>
          <p className="text-sm text-gray-500 mt-1">Students assigned to you</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Sessions</h3>
          <p className="text-3xl font-bold text-green-600">8</p>
          <p className="text-sm text-gray-500 mt-1">Sessions scheduled today</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Today</h3>
          <p className="text-3xl font-bold text-purple-600">5</p>
          <p className="text-sm text-gray-500 mt-1">Sessions completed</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium text-gray-900">Session with John Doe</p>
              <p className="text-sm text-gray-600">9:00 AM - 10:00 AM</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-medium text-gray-900">Session with Jane Smith</p>
              <p className="text-sm text-gray-600">10:30 AM - 11:30 AM</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="font-medium text-gray-900">Session with Mike Johnson</p>
              <p className="text-sm text-gray-600">2:00 PM - 3:00 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition">
              View My Students
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 transition">
              Schedule New Session
            </button>
            <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 transition">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
