import { Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Header({ user, onLogout }) {
  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            Career Guidance Management System
          </h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Bell className="h-6 w-6" />
          </button>

          <div className="ml-3 relative">
            <div className="flex items-center">
              <div className="ml-3">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
