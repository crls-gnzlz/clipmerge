import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import { getChainsWithClips, getUnassignedClips } from '../data/mockWorkspace.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiService from '../lib/api.js';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [chains, setChains] = useState([]);
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false); // Changed to false by default
  const [activeTab, setActiveTab] = useState('chains'); // 'chains' or 'clips'
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const chainsData = getChainsWithClips();
          const clipsData = getUnassignedClips();
          
          // Extract clips that are in chains from mock data
          const clipsInChains = [];
          chainsData.forEach(chain => {
            if (chain.clips && Array.isArray(chain.clips)) {
              chain.clips.forEach(clipItem => {
                const clipData = typeof clipItem === 'string' ? clipItem : clipItem.clip;
                if (clipData && typeof clipData === 'object') {
                  clipsInChains.push(clipData);
                }
              });
            }
          });
          
          // Combine all clips and remove duplicates
          const combinedClips = [...clipsData];
          clipsInChains.forEach(chainClip => {
            if (!combinedClips.find(clip => clip._id === chainClip._id)) {
              combinedClips.push(chainClip);
            }
          });
          
          setChains(chainsData);
          setClips(combinedClips);
          
          console.log('🎭 Dashboard: Mock data loaded');
          console.log('🔍 Dashboard: Mock chains:', chainsData.length);
          console.log('🔍 Dashboard: Mock clips sueltos:', clipsData.length);
          console.log('🔍 Dashboard: Mock clips en chains:', clipsInChains.length);
          console.log('🔍 Dashboard: Mock total clips:', combinedClips.length);
        } else {
          // Use real API calls
          if (isAuthenticated && user) {
            console.log('🔍 Dashboard: Loading real data for user:', user.username);
            
            // Load user's chains
            const chainsResponse = await apiService.getUserChains();
            if (chainsResponse.success) {
              setChains(chainsResponse.data || []);
              console.log('✅ Dashboard: Chains loaded:', chainsResponse.data?.length || 0);
              console.log('🔍 Dashboard: Sample chain data:', chainsResponse.data?.[0]);
            } else {
              console.warn('⚠️ Dashboard: Failed to load chains:', chainsResponse.message);
              setChains([]);
            }
            
            // Load user's clips
            const clipsResponse = await apiService.getUserClips();
            if (clipsResponse.success) {
              // Get all clips from the API
              const allClips = clipsResponse.data || [];
              
              // Also extract clips that are in chains
              const clipsInChains = [];
              chainsResponse.data?.forEach(chain => {
                if (chain.clips && Array.isArray(chain.clips)) {
                  chain.clips.forEach(clipItem => {
                    const clipData = typeof clipItem === 'string' ? clipItem : clipItem.clip;
                    if (clipData && typeof clipData === 'object') {
                      clipsInChains.push(clipData);
                    }
                  });
                }
              });
              
              // Combine all clips and remove duplicates
              const combinedClips = [...allClips];
              clipsInChains.forEach(chainClip => {
                if (!combinedClips.find(clip => clip._id === chainClip._id)) {
                  combinedClips.push(chainClip);
                }
              });
              
              setClips(combinedClips);
              console.log('✅ Dashboard: All clips loaded:', combinedClips.length);
              console.log('🔍 Dashboard: Clips from API:', allClips.length);
              console.log('🔍 Dashboard: Clips from chains:', clipsInChains.length);
            } else {
              console.warn('⚠️ Dashboard: Failed to load clips:', clipsResponse.message);
              setClips([]);
            }
          } else {
            console.log('ℹ️ Dashboard: User not authenticated, using mock data');
            const chainsData = getChainsWithClips();
            const clipsData = getUnassignedClips();
            
            // Extract clips that are in chains from mock data
            const clipsInChains = [];
            chainsData.forEach(chain => {
              if (chain.clips && Array.isArray(chain.clips)) {
                chain.clips.forEach(clipItem => {
                  const clipData = typeof clipItem === 'string' ? clipItem : clipItem.clip;
                  if (clipData && typeof clipData === 'object') {
                    clipsInChains.push(clipData);
                  }
                });
              }
            });
            
            // Combine all clips and remove duplicates
            const combinedClips = [...clipsData];
            clipsInChains.forEach(chainClip => {
              if (!combinedClips.find(clip => clip._id === chainClip._id)) {
                combinedClips.push(chainClip);
              }
            });
            
            setChains(chainsData);
            setClips(combinedClips);
            
            console.log('🎭 Dashboard: Mock data loaded (unauthenticated)');
            console.log('🔍 Dashboard: Mock chains:', chainsData.length);
            console.log('🔍 Dashboard: Mock clips sueltos:', clipsData.length);
            console.log('🔍 Dashboard: Mock clips en chains:', clipsInChains.length);
            console.log('🔍 Dashboard: Mock total clips:', combinedClips.length);
          }
        }
      } catch (error) {
        console.error('❌ Dashboard: Error loading data:', error);
        setError('Error loading data. Please try again.');
        
        // Fallback to mock data on error
        const chainsData = getChainsWithClips();
        const clipsData = getUnassignedClips();
        
        // Extract clips that are in chains from mock data
        const clipsInChains = [];
        chainsData.forEach(chain => {
          if (chain.clips && Array.isArray(chain.clips)) {
            chain.clips.forEach(clipItem => {
              const clipData = typeof clipItem === 'string' ? clipItem : clipItem.clip;
              if (clipData && typeof clipData === 'object') {
                clipsInChains.push(clipData);
              }
            });
          }
        });
        
        // Combine all clips and remove duplicates
        const combinedClips = [...clipsData];
        clipsInChains.forEach(chainClip => {
          if (!combinedClips.find(clip => clip._id === chainClip._id)) {
            combinedClips.push(chainClip);
          }
        });
        
        setChains(chainsData);
        setClips(combinedClips);
        
        console.log('🔄 Dashboard: Fallback to mock data due to error');
        console.log('🔍 Dashboard: Fallback total clips:', combinedClips.length);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [useMockData, isAuthenticated, user]);

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
      } else if (sortField === 'name') {
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
      } else if (sortField === 'clips') {
        aValue = (a.clips && a.clips.length) || 0;
        bValue = (b.clips && b.clips.length) || 0;
      } else if (sortField === 'title') {
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-light text-gray-900">Workspace</h1>
              <p className="text-gray-600">Manage your clips and chains</p>
            </div>
            
            {/* Data Status and Controls */}
            <div className="flex items-center space-x-3">
              {/* Data Source Indicator */}
              <div className="flex items-center space-x-2">
                {isAuthenticated && user ? (
                  <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    📡 Live Data
                  </span>
                ) : (
                  <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                    🎭 Mock Data
                  </span>
                )}
                
                {useMockData && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                    🧪 Mock Mode
                  </span>
                )}
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={() => {
                  setUseMockData(false);
                  // This will trigger useEffect to reload data
                }}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
              
              {/* Toggle Mock Data Button */}
              <button
                onClick={() => setUseMockData(!useMockData)}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                {useMockData ? '📡 Use Real Data' : '🎭 Use Mock Data'}
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

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
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => handleSort('clips')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Clips</span>
                              <SortIcon field="clips" />
                            </div>
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
                              <span className="text-sm text-gray-900">
                                {chain.clips && chain.clips.length > 0 ? chain.clips.length : 0} clips
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {chain.tags && chain.tags.length > 0 ? (
                                  chain.tags.slice(0, 2).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                                    >
                                      {tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400">No tags</span>
                                )}
                                {chain.tags && chain.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">
                                    +{chain.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(chain.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                chain.isPublic === true 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {chain.isPublic === true ? 'Public' : 'Private'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                {/* Preview Button */}
                                {chain.clips && chain.clips.length > 0 ? (
                                  <Link
                                    to={`/chain-preview/${chain._id}`}
                                    className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded"
                                    title="Preview chain"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </Link>
                                ) : (
                                  <button
                                    disabled
                                    className="text-gray-300 cursor-not-allowed p-1 rounded"
                                    title="Cannot preview: Chain has no clips"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                )}
                                
                                {/* Edit Button */}
                                <Link
                                  to={`/edit-chain/${chain._id}`}
                                  className="text-gray-400 hover:text-primary-600 transition-colors duration-200 p-1 rounded"
                                  title="Edit chain"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                
                                {/* Delete Button */}
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
                            Chain Status
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
                              <ChainStatusCell clip={clip} chains={chains} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(clip.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                {/* Preview Button - Show clip or go to chain if associated */}
                                <ChainPreviewButton clip={clip} chains={chains} />
                                
                                {/* Edit Button */}
                                <Link
                                  to={`/edit-clip/${clip._id}`}
                                  className="text-gray-400 hover:text-primary-600 transition-colors duration-200 p-1 rounded"
                                  title="Edit clip"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                
                                {/* Delete Button */}
                                <button 
                                  className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded"
                                  title="Delete clip"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

// Component to display chain status for a clip
const ChainStatusCell = ({ clip, chains }) => {
  // Debug logs to understand data structure
  console.log('🔍 ChainStatusCell: Clip:', clip);
  console.log('🔍 ChainStatusCell: Available chains:', chains);
  
  // Find which chain this clip belongs to
  const parentChain = chains.find(chain => {
    if (!chain.clips || !Array.isArray(chain.clips)) {
      console.log('🔍 ChainStatusCell: Chain has no clips array:', chain);
      return false;
    }
    
    const found = chain.clips.some(clipItem => {
      // Handle both direct clip ID and nested clip object
      const clipId = typeof clipItem === 'string' ? clipItem : clipItem.clip;
      const isMatch = clipId === clip._id;
      
      if (isMatch) {
        console.log('🔍 ChainStatusCell: Found clip in chain:', chain.name, 'clipItem:', clipItem);
      }
      
      return isMatch;
    });
    
    return found;
  });

  console.log('🔍 ChainStatusCell: Parent chain found:', parentChain);

  if (!parentChain) {
    return (
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Unassigned
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        In Chain
      </span>
      <Link
        to={`/edit-chain/${parentChain._id}`}
        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
        title={`Go to chain: ${parentChain.name}`}
      >
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {parentChain.name}
      </Link>
    </div>
  );
};

// Component to preview a clip or go to its chain
const ChainPreviewButton = ({ clip, chains }) => {
  // Find which chain this clip belongs to
  const parentChain = chains.find(chain => {
    if (!chain.clips || !Array.isArray(chain.clips)) {
      return false;
    }
    
    const found = chain.clips.some(clipItem => {
      const clipId = typeof clipItem === 'string' ? clipItem : clipItem.clip;
      return clipId === clip._id;
    });
    
    return found;
  });

  if (!parentChain) {
    return (
      <Link
        to={`/clip/${clip._id}`}
        className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded"
        title="Preview clip"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 6v12a3 3 0 103-3H6a3 3 0 103 3V6a3 3 0 10-3 3h18a3 3 0 10-3-3" />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      to={`/chain-preview/${parentChain._id}`}
      className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded"
      title={`Go to chain: ${parentChain.name}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </Link>
  );
};

export default Dashboard;
