import React, { useState } from 'react'
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import apiService from '../lib/api.js'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [alias, setAlias] = useState(user?.alias || user?.username || '')
  const [email] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAliasSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await apiService.updateProfile({ alias })
      updateUser({ ...user, alias })
      setSuccess('Alias updated!')
    } catch (err) {
      setError('Could not update alias')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await apiService.changePassword({ password, newPassword })
      setSuccess('Password updated!')
      setPassword('')
      setNewPassword('')
    } catch (err) {
      setError('Could not update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="max-w-2xl mx-auto py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>
        <form onSubmit={handleAliasSave} className="mb-10 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Alias</label>
            <input
              type="text"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2 border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50"
            disabled={loading}
          >
            Save Alias
          </button>
          {success && <div className="mt-4 text-green-600 text-sm">{success}</div>}
          {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
        </form>
        <form onSubmit={handlePasswordSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50"
            disabled={loading}
          >
            Change Password
          </button>
          {success && <div className="mt-4 text-green-600 text-sm">{success}</div>}
          {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
        </form>
      </div>
    </LayoutWithSidebar>
  )
}

export default Profile
