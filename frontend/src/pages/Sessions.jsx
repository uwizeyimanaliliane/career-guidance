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
      } else {
        const allSessions = []
        for (const student of students) {
          const studentSessions = await api.get(`/sessions/students/${student.id}`)
          allSessions.push(
            ...studentSessions.data.map(session => ({
              ...session,
              student_name: student.name,
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
  const formatDate = (dateString) => format(new Date(dateString), 'MMM dd, yyyy')

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-darkgreen"></div>
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
          <h1 className="text-2xl font-bold text-darkgreen">Counseling Sessions</h1>
          <p className="mt-1 text-sm text-green-700">
            View and manage counseling sessions for students
          </p>
        </div>
      </div>

      <div className="bg-green-50 shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-darkgreen">
                Filter by Student
              </label>
              <select
  id="student"
  name="student"
  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-black-300 rounded-md 
             focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm text-black"
  value={selectedStudent}
  onChange={handleStudentChange}
>
  <option value="">All Students</option>
  {students.map((student) => (
    <option key={student.id} value={student.id} className="text-green-600">
      {student.name} 
    </option>
  ))}
</select>

            </div>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-green-50 shadow rounded-lg p-6">
          <p className="text-center text-green-700">No sessions found</p>
        </div>
      ) : (
        <div className="bg-green-100 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-green-200">
            {sessions.map((session) => (
              <li key={session.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-darkgreen truncate">
                          {session.student_name || `Student ID: ${session.student_id}`}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs font-semibold rounded-full bg-darkgreen text-white">
                            {formatDate(session.session_date)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-green-800">
                            Counselor: {session.counselor_name}
                          </p>
                        </div>
                      </div>
                      {session.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-green-900">
                            <span className="font-medium">Notes:</span> {session.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Sessions
