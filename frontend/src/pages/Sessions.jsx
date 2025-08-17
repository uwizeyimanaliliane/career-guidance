import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { format } from 'date-fns'

const Sessions = () => {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [students, setStudents] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSession, setNewSession] = useState({
    student_id: '',
    counselor_name: '',
    session_date: '',
    notes: ''
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (students.length > 0) fetchSessions()
  }, [selectedStudent, students])

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students')
      setStudents(response.data)
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }

  const fetchSessions = async () => {
    try {
      setLoading(true)
      let response

      if (selectedStudent) {
        response = await api.get(`/sessions/students/${selectedStudent}`)
        const selected = students.find(s => s.id === Number(selectedStudent))
        response.data = response.data.map(session => ({
          ...session,
          student_name: selected ? `${selected.first_name} ${selected.last_name}` : ''
        }))
      } else {
        const allSessions = []
        for (const student of students) {
          const studentSessions = await api.get(`/sessions/students/${student.id}`)
          allSessions.push(
            ...studentSessions.data.map(session => ({
              ...session,
              student_name: `${student.first_name} ${student.last_name}`,
              student_id: student.id
            }))
          )
        }
        response = { data: allSessions }
      }

      setSessions(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleStudentChange = (e) => setSelectedStudent(e.target.value)

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const handleAddSession = async (e) => {
    e.preventDefault()
    try {
      await api.post('/sessions', newSession)
      setShowAddModal(false)
      setNewSession({ student_id: '', counselor_name: '', session_date: '', notes: '' })
      await fetchSessions()
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating session')
    }
  }

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return
    try {
      await api.delete(`/sessions/${id}`)
      fetchSessions()
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting session')
    }
  }

  const openAddModal = () => {
    setNewSession(prev => ({
      ...prev,
      student_id: selectedStudent || ''
    }))
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-md p-4">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Counseling Sessions</h1>
          <p className="mt-1 text-sm text-green-600">
            View and manage counseling sessions for students
          </p>
        </div>
        {(user?.role === 'staff' || user?.role === 'admin') && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800"
          >
            + Add Session
          </button>
        )}
      </div>

      {/* Student Filter */}
      <div className="bg-green-50 shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <label htmlFor="student" className="block text-sm font-medium text-green-900">
            Filter by Student
          </label>
          <select
            id="student"
            className="mt-1 block w-full border-green-300 rounded-md shadow-sm 
                       focus:ring-green-700 focus:border-green-700 sm:text-sm"
            value={selectedStudent}
            onChange={handleStudentChange}
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.first_name} {student.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-green-50 shadow rounded-lg p-6">
          <p className="text-center text-green-700">No sessions found</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li key={session.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 truncate">
                      {session.student_name || `Student ID: ${session.student_id}`}
                    </p>
                    <p className="text-sm text-gray-500">Counselor: {session.counselor_name}</p>
                    <p className="text-sm text-gray-500">
                      Date: {formatDate(session.session_date)}
                    </p>
                    {session.notes && (
                      <p className="mt-1 text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {session.notes}
                      </p>
                    )}
                  </div>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-green-800">Add New Session</h2>
            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <select
                  value={newSession.student_id}
                  onChange={(e) => setNewSession({ ...newSession, student_id: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Counselor</label>
                <input
                  type="text"
                  value={newSession.counselor_name}
                  onChange={(e) => setNewSession({ ...newSession, counselor_name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={newSession.session_date}
                  onChange={(e) => setNewSession({ ...newSession, session_date: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sessions
