import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx'
import { mockCollections, mockClips } from '../data/mockData.js'
import CopyNotification from '../components/CopyNotification.jsx'

const Dashboard = () => {
  const chains = mockCollections
  const clips = mockClips
  const [activeTab, setActiveTab] = useState('chains') // 'chains' or 'clips'
  const [showCopyNotification, setShowCopyNotification] = useState(false)



  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gray-50">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Workspace</h1>
              <p className="text-gray-600 mt-2">Manage your clips and chains in one central workspace</p>
            </div>
            <div className="flex items-center justify-between">
              {/* Space for future actions if needed */}
            </div>
          </div>

          {/* Central Work Area with Tabs */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tab Selector */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('chains')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeTab === 'chains'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Your Chains
                    </button>
                    <button
                      onClick={() => setActiveTab('clips')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeTab === 'clips'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Your Clips
                    </button>
                  </div>
                  
                  <Link 
                    to="/create" 
                    className="bg-secondary-950 hover:bg-secondary-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    {activeTab === 'chains' ? 'Create Chain' : 'Add Clip'}
                  </Link>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="overflow-hidden">
                {activeTab === 'chains' ? (
                  // Chains Tab
                  chains.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            Chain
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            Clips
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {chains.map((chain) => (
                          <tr key={chain.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {chain.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {chain.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                {chain.clips.length} clips
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(chain.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                chain.isPublic 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {chain.isPublic ? 'Public' : 'Private'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link 
                                to={`/chains/${chain.id}`}
                                className="text-primary-950 hover:text-primary-700 mr-4"
                              >
                                View
                              </Link>
                              <Link 
                                to={`/chains/${chain.id}/edit`}
                                className="text-primary-950 hover:text-primary-700"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No chains yet</h3>
                      <p className="text-gray-500 mb-6">
                        Start by creating your first chain to organize your clips.
                      </p>
                      <Link 
                        to="/create" 
                        className="bg-secondary-950 hover:bg-secondary-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Create your first chain
                      </Link>
                    </div>
                  )
                ) : (
                  // Clips Tab
                  clips.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            Tags
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            Created
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {clips.map((clip) => (
                          <tr key={clip.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {clip.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {clip.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {Math.floor((clip.endTime - clip.startTime) / 60)}:{(clip.endTime - clip.startTime) % 60 < 10 ? '0' : ''}{(clip.endTime - clip.startTime) % 60}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {clip.tags.map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(clip.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link 
                                to={`/clips/${clip.id}`}
                                className="text-primary-950 hover:text-primary-700 mr-4"
                              >
                                View
                              </Link>
                              <Link 
                                to={`/clips/${clip.id}/edit`}
                                className="text-primary-950 hover:text-primary-700"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No clips yet</h3>
                      <p className="text-gray-500 mb-6">
                        Start by creating your first clip to save video moments.
                      </p>
                      <Link 
                        to="/create" 
                        className="bg-secondary-950 hover:bg-secondary-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Create your first clip
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>



        {/* Copy Notification */}
        <CopyNotification 
          isVisible={showCopyNotification} 
          onClose={() => setShowCopyNotification(false)} 
        />
      </div>
    </LayoutWithSidebar>
  )
}

export default Dashboard
