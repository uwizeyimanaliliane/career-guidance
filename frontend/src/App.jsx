import { Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import StaffDashboard from './pages/StaffDashboard'
import Students from './pages/Students'
import StudentDetail from './pages/StudentDetail'
import Sessions from './pages/Sessions'
import Analytics from './pages/Analytics'
import NotFound from './pages/NotFound'

// Configuration constants
const ANALYTICS_CONFIG = {
  maxAnalyticsEntries: 100,
  maxUserActions: 200,
  cleanupPercentage: 0.3, // Remove 30% of oldest entries when limit reached
  compressionEnabled: true
}

// Utility function to safely store data with size limits
const safeLocalStorageSet = (key, data, maxEntries) => {
  try {
    // Ensure data is an array
    if (!Array.isArray(data)) {
      data = [data]
    }

    // Limit the number of entries
    if (data.length > maxEntries) {
      const removeCount = Math.ceil(maxEntries * ANALYTICS_CONFIG.cleanupPercentage)
      data = data.slice(removeCount) // Remove oldest entries
    }

    // Compress data if enabled
    let storageData = data
    if (ANALYTICS_CONFIG.compressionEnabled) {
      // Remove redundant data for compression
      storageData = data.map(item => ({
        ...item,
        userAgent: data.length > 10 ? undefined : item.userAgent, // Remove userAgent for bulk entries
        screenResolution: data.length > 10 ? undefined : item.screenResolution,
        referrer: data.length > 10 ? undefined : item.referrer
      }))
    }

    const jsonString = JSON.stringify(storageData)
    
    // Check if we're approaching the limit
    if (jsonString.length > 1024 * 1024 * 4) { // 4MB limit check
      console.warn(`Data for ${key} is too large, skipping storage`)
      return false
    }

    localStorage.setItem(key, jsonString)
    return true
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn(`Storage quota exceeded for ${key}, attempting cleanup...`)
      
      // Try to clean up old data
      try {
        const existing = JSON.parse(localStorage.getItem(key) || '[]')
        if (existing.length > 0) {
          const removeCount = Math.ceil(existing.length * ANALYTICS_CONFIG.cleanupPercentage)
          const cleaned = existing.slice(removeCount)
          localStorage.setItem(key, JSON.stringify(cleaned))
          
          // Try again with cleaned data
          return safeLocalStorageSet(key, [...cleaned, ...data], maxEntries)
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup storage:', cleanupError)
      }
      
      // As last resort, clear the specific key
      localStorage.removeItem(key)
      console.warn(`Cleared ${key} due to storage quota`)
    } else {
      console.error('Storage error:', error)
    }
    return false
  }
}

// Analytics tracking utility
const trackPageView = (path, userRole, userId) => {
  const analyticsData = {
    path,
    timestamp: new Date().toISOString(),
    userRole,
    userId,
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer
  }

  // Get existing analytics
  const existingAnalytics = JSON.parse(localStorage.getItem('app_analytics') || '[]')
  existingAnalytics.push(analyticsData)
  
  // Store with size limits
  safeLocalStorageSet('app_analytics', existingAnalytics, ANALYTICS_CONFIG.maxAnalyticsEntries)

  console.log('Analytics - Page View:', analyticsData)
}

const trackUserAction = (action, details = {}) => {
  const actionData = {
    action,
    details,
    timestamp: new Date().toISOString()
  }

  // Get existing actions
  const existingActions = JSON.parse(localStorage.getItem('user_actions') || '[]')
  existingActions.push(actionData)
  
  // Store with size limits
  safeLocalStorageSet('user_actions', existingActions, ANALYTICS_CONFIG.maxUserActions)

  console.log('Analytics - User Action:', actionData)
}

function App() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigationType = useNavigationType()

  // Analytics tracking
  useEffect(() => {
    if (!loading && user) {
      trackPageView(location.pathname, user.role, user.id)
    }
  }, [location, user, loading])

  // Track user session start
  useEffect(() => {
    if (!loading && user) {
      trackUserAction('session_start', {
        userId: user.id,
        userRole: user.role,
        navigationType
      })
    }
  }, [user, loading, navigationType])

  // Track component mount/unmount
  useEffect(() => {
    trackUserAction('app_mount')
    
    return () => {
      trackUserAction('app_unmount')
    }
  }, [])

  // Track login page views for non-authenticated users
  useEffect(() => {
    if (!loading && !user) {
      trackUserAction('login_page_view')
    }
  }, [user, loading])

  // Track dashboard access
  useEffect(() => {
    if (!loading && user) {
      trackUserAction('dashboard_access', {
        userRole: user.role,
        dashboardType: user.role === 'admin' ? 'admin' : 'staff'
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

  // Role-based dashboard component
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
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

// Global analytics API for external access
window.analyticsAPI = {
  trackPageView,
  trackUserAction,
  getAnalytics: () => JSON.parse(localStorage.getItem('app_analytics') || '[]'),
  getUserActions: () => JSON.parse(localStorage.getItem('user_actions') || '[]'),
  clearAnalytics: () => {
    localStorage.removeItem('app_analytics')
    localStorage.removeItem('user_actions')
  }
}

export default App
