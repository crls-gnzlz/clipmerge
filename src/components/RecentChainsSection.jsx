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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Recent Chains
          </h2>
          <p className="text-xs text-gray-600 font-light">
            Continue working on your latest clipchains
          </p>
        </div>
        <Link 
          to="/workspace"
          className="text-primary-600 hover:text-primary-700 font-medium text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 rounded px-2 py-1"
        >
          View all in Workspace →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
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
            <p className="text-sm text-gray-600 mb-4 font-light">Start creating your first clipchain to see it here</p>
            <Link
              to="/create-clip"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              Create your first chain
            </Link>
          </div>
        ) : (
          recentChains.map((chain) => (
            <Link
              key={chain._id}
              to={`/edit-chain/${chain._id}`}
              className="group block bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200 hover:shadow-sm border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              <div className="space-y-3">
                {/* Title */}
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-200 truncate">
                  {chain.name}
                </h3>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {chain.clips?.length || 0} clips
                  </span>
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(chain.totalDuration ? `${Math.floor(chain.totalDuration / 60)}:${(chain.totalDuration % 60).toString().padStart(2, '0')}` : '0:00')}
                  </span>
                </div>

                {/* Updated date */}
                <div className="text-xs text-gray-400 font-light">
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
