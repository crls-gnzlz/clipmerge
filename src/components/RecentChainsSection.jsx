import React from 'react'
import { Link } from 'react-router-dom'

const RecentChainsSection = () => {
  // Mock data for recent chains - in a real app this would come from an API or database
  const recentChains = [
    {
      id: 'chain-1',
      title: 'React Hooks Tutorial',
      description: 'Complete guide to React Hooks with practical examples',
      author: 'Carlos Dev',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      clipCount: 8,
      totalDuration: '45:30',
      thumbnail: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=React+Hooks',
      tags: ['React', 'JavaScript', 'Frontend']
    },
    {
      id: 'chain-2',
      title: 'TypeScript Fundamentals',
      description: 'Learn TypeScript from basics to advanced patterns',
      author: 'Carlos Dev',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      clipCount: 12,
      totalDuration: '1:15:20',
      thumbnail: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=TypeScript',
      tags: ['TypeScript', 'JavaScript', 'Programming']
    },
    {
      id: 'chain-3',
      title: 'CSS Grid Mastery',
      description: 'Master CSS Grid layout with real-world examples',
      author: 'Carlos Dev',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-12',
      clipCount: 6,
      totalDuration: '32:15',
      thumbnail: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=CSS+Grid',
      tags: ['CSS', 'Frontend', 'Layout']
    },
    {
      id: 'chain-4',
      title: 'Node.js Backend Development',
      description: 'Build robust backend APIs with Node.js and Express',
      author: 'Carlos Dev',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-08',
      clipCount: 10,
      totalDuration: '58:45',
      thumbnail: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Node.js',
      tags: ['Node.js', 'Backend', 'API']
    }
  ]

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Recent Chains
          </h2>
          <p className="text-sm text-gray-600">
            Continue working on your latest clipchains
          </p>
        </div>
        <Link 
          to="/dashboard"
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          Ver todo en Workspace →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {recentChains.map((chain) => (
          <Link
            key={chain.id}
            to={`/edit-chain/${chain.id}`}
            className="group block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-gray-300"
          >
            <div className="space-y-2">
              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-secondary-950 transition-colors duration-200 truncate">
                {chain.title}
              </h3>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {chain.clipCount} clips
                </span>
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(chain.totalDuration)}
                </span>
              </div>

              {/* Updated date */}
              <div className="text-xs text-gray-400">
                Updated {formatDate(chain.updatedAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state for when no recent chains */}
      {recentChains.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent chains</h3>
          <p className="text-gray-600 mb-4">Start creating your first clipchain to see it here</p>
          <Link
            to="/create-clip"
            className="inline-flex items-center px-4 py-2 bg-secondary-950 text-white rounded-lg hover:bg-secondary-900 transition-colors duration-200"
          >
            Create your first chain
          </Link>
        </div>
      )}
    </div>
  )
}

export default RecentChainsSection
