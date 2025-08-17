import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { studentsAPI } from '../services/api'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Students() {
  const queryClient = useQueryClient()
  const { data: students, isLoading, error } = useQuery('students', () =>
    studentsAPI.getAll().then(res => res.data)
  )
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({ first_name: '', last_name: '', career_interest: '' })

  const createMutation = useMutation(studentsAPI.create, {
    onSuccess: () => {
      toast.success('Student created')
      queryClient.invalidateQueries('students')
      setFormData({ first_name: '', last_name: '', career_interest: '' })
    },
    onError: () => toast.error('Failed to create student'),
  })

  const updateMutation = useMutation(({ id, data }) => studentsAPI.update(id, data), {
    onSuccess: () => {
      toast.success('Student updated')
      queryClient.invalidateQueries('students')
      setEditingStudent(null)
    },
    onError: () => toast.error('Failed to update student'),
  })

  const deleteMutation = useMutation(studentsAPI.delete, {
    onSuccess: () => {
      toast.success('Student deleted')
      queryClient.invalidateQueries('students')
    },
    onError: () => toast.error('Failed to delete student'),
  })

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCreate = (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleEdit = (student) => {
    setEditingStudent(student.id)
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      career_interest: student.career_interest || '',
    })
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    updateMutation.mutate({ id: editingStudent, data: formData })
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="text-center text-lg font-semibold text-green-800">Loading students...</div>
  }

  if (error) {
    return <div className="text-center text-lg font-semibold text-red-600">Error loading students: {error.message}</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-green-900 mb-6">Manage Students</h1>

      {/* Create / Edit Form */}
      <form
        onSubmit={editingStudent ? handleUpdate : handleCreate}
        className="mb-8 p-6 bg-white rounded-2xl shadow-md space-y-4"
      >
        <div>
          <label className="block text-sm font-semibold text-green-800">First Name</label>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
            className="mt-1 w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-green-800">Last Name</label>
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
            className="mt-1 w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-green-800">Career Interest</label>
          <input
            name="career_interest"
            value={formData.career_interest}
            onChange={handleInputChange}
            className="mt-1 w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
          />
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-5 rounded-lg transition transform hover:scale-105"
          >
            {editingStudent ? 'Update Student' : 'Add Student'}
          </button>
          {editingStudent && (
            <button
              type="button"
              onClick={() => setEditingStudent(null)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-5 rounded-lg transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Students List */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200 rounded-2xl overflow-hidden">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">First Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Last Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Career Interest</th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students && students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-green-50 transition">
                  <td className="px-6 py-4">
                    <Link to={`/students/${student.id}`} className="text-green-700 hover:underline font-semibold">
                      {student.first_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{student.last_name}</td>
                  <td className="px-6 py-4">{student.career_interest || 'NULL'}</td>
                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
