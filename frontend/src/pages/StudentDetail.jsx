import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { studentsAPI, sessionsAPI } from '../services/api'
import { Calendar, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function StudentDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [showSessionForm, setShowSessionForm] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data: student, isLoading: loadingStudent } = useQuery(
    ['student', id],
    () => studentsAPI.getById(id).then(res => res.data)
  )

  const { data: sessions = [], isLoading: loadingSessions } = useQuery(
    ['sessions', id],
    () => sessionsAPI.getByStudentId(id).then(res => res.data)
  )

  const createSessionMutation = useMutation(
    (data) => sessionsAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Session added')
        queryClient.invalidateQueries(['sessions', id])
        reset()
        setShowSessionForm(false)
      },
      onError: () => toast.error('Failed to add session')
    }
  )

  const onSubmitSession = (data) => {
    createSessionMutation.mutate({ ...data, student_id: id })
  }

  if (loadingStudent) return <div>Loading student...</div>
  if (!student) return <div>Student not found</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {student.first_name} {student.last_name}
      </h1>
      <p className="mb-4">Career Interest: {student.career_interest || 'N/A'}</p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Counseling Sessions</h2>
        {loadingSessions ? (
          <p>Loading sessions...</p>
        ) : (
          <ul className="space-y-2">
            {sessions.length === 0 && <p>No sessions found.</p>}
            {sessions.map((session) => (
              <li key={session.id} className="border p-3 rounded">
                <div className="flex justify-between">
                  <div>
                    <p><strong>Counselor:</strong> {session.counselor_name}</p>
                    <p><strong>Date:</strong> {format(new Date(session.session_date), 'PPP')}</p>
                    <p><strong>Notes:</strong> {session.notes || 'None'}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => setShowSessionForm(!showSessionForm)}
        className="mb-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
      >
        <Plus className="mr-2" /> {showSessionForm ? 'Cancel' : 'Add Session'}
      </button>

      {showSessionForm && (
        <form onSubmit={handleSubmit(onSubmitSession)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Counselor Name</label>
            <input
              {...register('counselor_name', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Counselor Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Session Date</label>
            <input
              type="date"
              {...register('session_date', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              {...register('notes')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              rows={3}
              placeholder="Session notes"
            />
          </div>
          <button
            type="submit"
            disabled={createSessionMutation.isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {createSessionMutation.isLoading ? 'Saving...' : 'Save Session'}
          </button>
        </form>
      )}
    </div>
  )
}
