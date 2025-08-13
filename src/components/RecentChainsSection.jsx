import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import apiService from '../lib/api.js'

const RecentChainsSection = () => {
  const { user, isAuthenticated } = useAuth()
  const [recentChains, setRecentChains] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentChains = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true)
          const response = await apiService.getUserChains()
          const chains = response.data || []
          // Sort by updatedAt (most recent first) and take first 4
          const sortedChains = chains
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 4)
          setRecentChains(sortedChains)
        } catch (error) {
          console.error('Error fetching recent chains:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchRecentChains()
  }, [isAuthenticated, user])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatDuration = (duration) => {
    const [hours, minutes] = duration.split(':').map(Number)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Recent Chains
          </h2>
          <p className="text-xs text-gray-600">
            Continue working on your latest clipchains
          </p>
        </div>
        <Link 
          to="/dashboard"
          className="text-primary-600 hover:text-primary-700 font-medium text-xs"
        >
          View all in Workspace →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="text-center py-8">
            <svg className="w-9 h-9 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-base font-medium text-gray-900 mb-2">Loading recent chains...</h3>
          </div>
        ) : recentChains.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-9 h-9 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-base font-medium text-gray-900 mb-2">No recent chains</h3>
            <p className="text-sm text-gray-600 mb-4">Start creating your first clipchain to see it here</p>
            <Link
              to="/create-clip"
              className="inline-flex items-center px-3 py-1.5 bg-secondary-950 text-white rounded-lg hover:bg-secondary-900 transition-colors duration-200 text-sm"
            >
              Create your first chain
            </Link>
          </div>
        ) : (
          recentChains.map((chain) => (
            <Link
              key={chain._id}
              to={`/edit-chain/${chain._id}`}
              className="group block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-gray-300"
            >
              <div className="space-y-2">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-secondary-950 transition-colors duration-200 truncate">
                  {chain.name}
                </h3>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {chain.clips?.length || 0} clips
                  </span>
                  <span className="flex items-center">
                    <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(chain.totalDuration ? `${Math.floor(chain.totalDuration / 60)}:${(chain.totalDuration % 60).toString().padStart(2, '0')}` : '0:00')}
                  </span>
                </div>

                {/* Updated date */}
                <div className="text-xs text-gray-400">
                  Updated {formatDate(chain.updatedAt || chain.createdAt)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default RecentChainsSection
