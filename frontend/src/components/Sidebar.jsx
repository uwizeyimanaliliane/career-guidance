import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">CGMIS</h1>
          </div>
          <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center rounded-md px-2 py-2 text-sm font-medium`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-5 w-5 flex-shrink-0`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <div className="group block w-full flex-shrink-0">
            <div className="flex items-center">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
                  <span className="text-sm font-medium leading-none text-white">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
