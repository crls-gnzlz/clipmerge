import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'

const EditChain = () => {
  const { chainId } = useParams()
  const [chain, setChain] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - in a real app this would come from an API
  const mockChains = {
    'chain-1': {
      id: 'chain-1',
      title: 'React Hooks Tutorial',
      description: 'Complete guide to React Hooks with practical examples',
      author: 'Carlos Dev',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      clipCount: 8,
      totalDuration: '45:30',
      thumbnail: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=React+Hooks',
      tags: ['React', 'JavaScript', 'Frontend'],
      clips: [
        {
          id: 'clip-1',
          title: 'Introduction to Hooks',
          description: 'Learn the basics of React Hooks',
          videoId: '7xTGNNLPyMI',
          startTime: 120,
          endTime: 300,
          duration: 180
        },
        {
          id: 'clip-2',
          title: 'useState Hook',
          description: 'Understanding the useState hook',
          videoId: '7xTGNNLPyMI',
          startTime: 350,
          endTime: 520,
          duration: 170
        }
      ]
    },
    'chain-2': {
      id: 'chain-2',
      title: 'TypeScript Fundamentals',
      description: 'Learn TypeScript from basics to advanced patterns',
      author: 'Carlos Dev',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      clipCount: 12,
      totalDuration: '1:15:20',
      thumbnail: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=TypeScript',
      tags: ['TypeScript', 'JavaScript', 'Programming'],
      clips: [
        {
          id: 'clip-1',
          title: 'TypeScript Basics',
          description: 'Introduction to TypeScript',
          videoId: '7xTGNNLPyMI',
          startTime: 232,
          endTime: 400,
          duration: 168
        }
      ]
    },
    'chain-3': {
      id: 'chain-3',
      title: 'CSS Grid Mastery',
      description: 'Master CSS Grid layout with real-world examples',
      author: 'Carlos Dev',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-12',
      clipCount: 6,
      totalDuration: '32:15',
      thumbnail: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=CSS+Grid',
      tags: ['CSS', 'Frontend', 'Layout'],
      clips: [
        {
          id: 'clip-1',
          title: 'CSS Grid Basics',
          description: 'Learn CSS Grid fundamentals',
          videoId: '7xTGNNLPyMI',
          startTime: 500,
          endTime: 650,
          duration: 150
        }
      ]
    },
    'chain-4': {
      id: 'chain-4',
      title: 'Node.js Backend Development',
      description: 'Build robust backend APIs with Node.js and Express',
      author: 'Carlos Dev',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-08',
      clipCount: 10,
      totalDuration: '58:45',
      thumbnail: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Node.js',
      tags: ['Node.js', 'Backend', 'API'],
      clips: [
        {
          id: 'clip-1',
          title: 'Node.js Setup',
          description: 'Setting up a Node.js project',
          videoId: '7xTGNNLPyMI',
          startTime: 700,
          endTime: 850,
          duration: 150
        }
      ]
    }
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundChain = mockChains[chainId]
      if (foundChain) {
        setChain(foundChain)
      }
      setIsLoading(false)
    }, 500)
  }, [chainId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-950 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chain...</p>
        </div>
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chain not found</h1>
          <p className="text-gray-600 mb-6">The chain you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-secondary-950 text-white rounded-lg hover:bg-secondary-900 transition-colors duration-200"
          >
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{chain.title}</h1>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>By {chain.author}</span>
            <span>•</span>
            <span>{chain.clipCount} clips</span>
            <span>•</span>
            <span>{chain.totalDuration}</span>
            <span>•</span>
            <span>Updated {new Date(chain.updatedAt).toLocaleDateString()}</span>
          </div>

          <p className="text-gray-700 mt-2 max-w-3xl">{chain.description}</p>

          <div className="flex items-center space-x-2 mt-4">
            {chain.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-secondary-100 text-secondary-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 mb-8">
          <button className="px-6 py-2 bg-secondary-950 text-white rounded-lg hover:bg-secondary-900 transition-colors duration-200">
            Edit Chain
          </button>
          <button className="px-6 py-2 bg-white text-secondary-950 border border-secondary-950 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
            Add Clip
          </button>
          <button className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Share
          </button>
          <button className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Export
          </button>
        </div>

        {/* Player Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
          <ClipchainPlayer
            id={chain.id}
            title={chain.title}
            description={chain.description}
            clips={chain.clips}
            author={chain.author}
            createdAt={chain.createdAt}
            tags={chain.tags}
          />
        </div>

        {/* Clips List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Clips ({chain.clips.length})</h2>
            <button className="px-4 py-2 bg-secondary-950 text-white rounded-lg hover:bg-secondary-900 transition-colors duration-200">
              Add New Clip
            </button>
          </div>

          <div className="space-y-4">
            {chain.clips.map((clip, index) => (
              <div
                key={clip.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-secondary-100 text-secondary-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{clip.title}</h3>
                  <p className="text-sm text-gray-600">{clip.description}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>Video ID: {clip.videoId}</span>
                    <span>•</span>
                    <span>{clip.startTime}s - {clip.endTime}s</span>
                    <span>•</span>
                    <span>{clip.duration}s</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {chain.clips.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clips yet</h3>
              <p className="text-gray-600 mb-4">Add your first clip to get started</p>
              <button className="inline-flex items-center px-4 py-2 bg-secondary-950 text-white rounded-lg hover:bg-secondary-900 transition-colors duration-200">
                Add your first clip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditChain
