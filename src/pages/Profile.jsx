import React, { useState, useEffect } from 'react'
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
  const [referralStats, setReferralStats] = useState(null)
  const [referralLink, setReferralLink] = useState('')
  const [referralLoading, setReferralLoading] = useState(false)

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

  // Fetch referral data
  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setReferralLoading(true)
        const response = await apiService.getReferralLink()
        if (response.success) {
          setReferralLink(response.data.referralLink)
          setReferralStats(response.data.referralStats)
        }
      } catch (error) {
        console.error('Error fetching referral data:', error)
      } finally {
        setReferralLoading(false)
      }
    }

    if (user) {
      fetchReferralData()
    }
  }, [user])

  const copyReferralLink = async () => {
    if (!referralLink) return
    
    try {
      await navigator.clipboard.writeText(referralLink)
      setSuccess('Referral link copied to clipboard!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Could not copy referral link')
      setTimeout(() => setError(''), 3000)
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

        {/* Referral Statistics Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Referral Program</h3>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm text-blue-600 font-medium">Invite Friends</span>
            </div>
          </div>
          
          {referralLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading referral data...</p>
            </div>
          ) : referralStats ? (
            <div className="space-y-6">
              {/* Referral Link */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Your Referral Link</h4>
                    <p className="text-xs text-blue-600">Share this link to invite friends</p>
                  </div>
                  <button 
                    onClick={copyReferralLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-2 text-blue-700 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="truncate">{referralLink ? referralLink.replace(/^https?:\/\//, '') : 'Loading...'}</span>
                  </div>
                </div>
              </div>

                             {/* Referral Statistics */}
               <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                 <div className="flex items-center space-x-4">
                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                     <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                   </div>
                   <div>
                     <div className="text-3xl font-bold text-green-600">{referralStats.totalReferrals}</div>
                     <div className="text-lg text-green-700">Total Referrals</div>
                     <div className="text-sm text-green-600">Users who completed registration</div>
                   </div>
                 </div>
               </div>

              
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
                             <h4 className="text-lg font-medium text-gray-800 mb-2">No Referrals Yet</h4>
               <p className="text-gray-600 mb-4">Start inviting friends to grow your network! Each successful registration counts as a referral.</p>
              <button 
                onClick={copyReferralLink}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Get Your Referral Link
              </button>
            </div>
          )}
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

export default Profile
