import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import { getChainsWithClips, getUnassignedClips } from '../data/mockWorkspace.js';

const Dashboard = () => {
  const [chains, setChains] = useState([]);
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(true);
  const [activeTab, setActiveTab] = useState('chains'); // 'chains' or 'clips'
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const chainsData = getChainsWithClips();
          const clipsData = getUnassignedClips();
          
          setChains(chainsData);
          setClips(clipsData);
        } else {
          // TODO: Implement real API calls
          console.log('Real API not implemented yet');
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [useMockData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Sort data based on current sort field and direction
  const getSortedData = (data) => {
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortField === 'name' || sortField === 'title') {
        aValue = (a[sortField] || '').toLowerCase();
        bValue = (b[sortField] || '').toLowerCase();
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <LayoutWithSidebar>
        <div className="min-h-full bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LayoutWithSidebar>
    );
  }

  const sortedChains = getSortedData(chains);
  const sortedClips = getSortedData(clips);

  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-light text-gray-900 mb-2">
                  Workspace
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your video clips and chains
                </p>
              </div>
              
              {/* Mock Data Toggle */}
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMockData}
                    onChange={(e) => setUseMockData(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-opacity-50"
                  />
                  <span className="text-xs text-gray-600">Use mock data</span>
                </label>
                {useMockData && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Mock Mode
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content with Tabs */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Tab Selector */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('chains')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'chains'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Chains ({chains.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('clips')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'clips'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Clips ({clips.length})
                  </button>
                </div>
                
                <Link
                  to={activeTab === 'chains' ? '/create-chain' : '/create'}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {activeTab === 'chains' ? 'Create Chain' : 'Create Clip'}
                </Link>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="overflow-hidden">
              {activeTab === 'chains' ? (
                // Chains Tab
                chains.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No chains yet</h3>
                    <p className="text-gray-500 mb-6">Create your first chain to organize related video clips</p>
                    <Link
                      to="/create-chain"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200"
                    >
                      Create Your First Chain
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Chain</span>
                              <SortIcon field="name" />
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            Clips
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => handleSort('createdAt')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Created</span>
                              <SortIcon field="createdAt" />
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedChains.map((chain) => (
                          <tr key={chain._id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {chain.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{chain.clipCount} clips</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(chain.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                chain.status === 'public' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {chain.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Link
                                  to={`/edit-chain/${chain._id}`}
                                  className="text-gray-400 hover:text-primary-600 transition-colors duration-200 p-1 rounded"
                                  title="Edit chain"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                <button 
                                  className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded"
                                  title="Delete chain"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                // Clips Tab
                clips.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No clips yet</h3>
                    <p className="text-gray-500 mb-6">Create your first clip to get started</p>
                    <Link
                      to="/create"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200"
                    >
                      Create Your First Clip
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => handleSort('title')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Title</span>
                              <SortIcon field="title" />
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            Tags
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => handleSort('createdAt')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Created</span>
                              <SortIcon field="createdAt" />
                            </div>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedClips.map((clip) => (
                          <tr key={clip._id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {clip.title}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDuration(clip.duration)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {clip.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {clip.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">
                                    +{clip.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(clip.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Link
                                  to={`/edit-clip/${clip._id}`}
                                  className="text-gray-400 hover:text-primary-600 transition-colors duration-200 p-1 rounded"
                                  title="Edit clip"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                <button 
                                  className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded"
                                  title="Delete clip"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
};

export default Dashboard;
