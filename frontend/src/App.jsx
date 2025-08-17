import { Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'

// Layout + Pages
import Layout from './components/Layout'
import Login from './pages/LoginEnhanced'
import Register from './pages/RegisterEnhanced'
import AdminDashboard from './pages/AdminDashboard'
import StaffDashboard from './pages/StaffDashboard'
import StaffForm from './pages/StaffForm'
import SessionForm from './pages/SessionForm'
import Students from './pages/Students'
import Sessions from './pages/Sessions'
import Analytics from './pages/Analytics'
import ReportsPage from './pages/ReportsPage';
import NotFound from './pages/NotFound'

const ANALYTICS_CONFIG = {
  maxAnalyticsEntries: 100,
  maxUserActions: 200,
  cleanupPercentage: 0.3,
  compressionEnabled: true,
}

// ===============================
// UTIL FUNCTIONS
// ===============================
const safeLocalStorageSet = (key, data, maxEntries) => {
  try {
    if (!Array.isArray(data)) data = [data]

    if (data.length > maxEntries) {
      const removeCount = Math.ceil(maxEntries * ANALYTICS_CONFIG.cleanupPercentage)
      data = data.slice(removeCount)
    }

    let storageData = data
    if (ANALYTICS_CONFIG.compressionEnabled) {
      storageData = data.map(item => ({
        ...item,
        userAgent: data.length > 10 ? undefined : item.userAgent,
        screenResolution: data.length > 10 ? undefined : item.screenResolution,
        referrer: data.length > 10 ? undefined : item.referrer,
      }))
    }

    const jsonString = JSON.stringify(storageData)
    if (jsonString.length > 1024 * 1024 * 4) {
      console.warn(`Data for ${key} is too large, skipping storage`)
      return false
    }

    localStorage.setItem(key, jsonString)
    return true
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn(`Storage quota exceeded for ${key}, attempting cleanup...`)
      try {
        const existing = JSON.parse(localStorage.getItem(key) || '[]')
        if (existing.length > 0) {
          const removeCount = Math.ceil(existing.length * ANALYTICS_CONFIG.cleanupPercentage)
          const cleaned = existing.slice(removeCount)
          localStorage.setItem(key, JSON.stringify(cleaned))
          return safeLocalStorageSet(key, [...cleaned, ...data], maxEntries)
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup storage:', cleanupError)
      }
      localStorage.removeItem(key)
      console.warn(`Cleared ${key} due to storage quota`)
    } else {
      console.error('Storage error:', error)
    }
    return false
  }
}

const trackPageView = (path, userRole, userId) => {
  const analyticsData = {
    path,
    timestamp: new Date().toISOString(),
    userRole,
    userId,
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer,
  }
  const existingAnalytics = JSON.parse(localStorage.getItem('app_analytics') || '[]')
  existingAnalytics.push(analyticsData)
  safeLocalStorageSet('app_analytics', existingAnalytics, ANALYTICS_CONFIG.maxAnalyticsEntries)
}

const trackUserAction = (action, details = {}) => {
  const actionData = {
    action,
    details,
    timestamp: new Date().toISOString(),
  }
  const existingActions = JSON.parse(localStorage.getItem('user_actions') || '[]')
  existingActions.push(actionData)
  safeLocalStorageSet('user_actions', existingActions, ANALYTICS_CONFIG.maxUserActions)
}

// ===============================
// APP COMPONENT
// ===============================
function AppRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (!loading && user) {
      trackPageView(location.pathname, user.role, user.id)
    }
  }, [location, user, loading])

  useEffect(() => {
    if (!loading && user) {
      trackUserAction('session_start', { userId: user.id, userRole: user.role, navigationType })
    }
  }, [user, loading, navigationType])

  useEffect(() => {
    trackUserAction('app_mount')
    return () => trackUserAction('app_unmount')
  }, [])

  useEffect(() => {
    if (!loading && !user) trackUserAction('login_page_view')
  }, [user, loading])

  useEffect(() => {
    if (!loading && user) {
      trackUserAction('dashboard_access', {
        userRole: user.role,
        dashboardType: user.role === 'admin' ? 'admin' : 'staff',
      })
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  const getDashboardComponent = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />
      case 'staff':
        return <StaffDashboard />
      default:
        return <StaffDashboard />
    }
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={getDashboardComponent()} />
        <Route path="/students" element={<Students />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/staff/new" element={<StaffForm />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/sessions/new" element={<SessionForm />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

// ===============================
// APP COMPONENT
// ===============================
export default function App() {
  return <AppRoutes />;
}

// ===============================
// GLOBAL ANALYTICS API
// ===============================
window.analyticsAPI = {
  trackPageView,
  trackUserAction,
  getAnalytics: () => JSON.parse(localStorage.getItem('app_analytics') || '[]'),
  getUserActions: () => JSON.parse(localStorage.getItem('user_actions') || '[]'),
  clearAnalytics: () => {
    localStorage.removeItem('app_analytics')
    localStorage.removeItem('user_actions')
  },
}
