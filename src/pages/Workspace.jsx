import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import { getChainsWithClips, getUnassignedClips } from '../data/mockWorkspace.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiService from '../lib/api.js';
import AppNotification from '../components/AppNotification.jsx';
import { PlayCircleIcon, FolderPlusIcon } from '@heroicons/react/24/solid'

const Workspace = () => {
  const { user, isAuthenticated } = useAuth();
  const [chains, setChains] = useState([]);
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Cambia el estado inicial de activeTab para leer de localStorage
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('workspaceActiveTab') || 'chains';
    }
    return 'chains';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'chain'|'clip', id, name }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [notification, setNotification] = useState({ isVisible: false, type: 'info', title: '', message: '' });

  // Guarda la tab activa en localStorage al cambiar
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('workspaceActiveTab', tab);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (isAuthenticated && user) {
          // Use real API calls
          const chainsResponse = await apiService.getUserChains();
          if (chainsResponse.success) {
            setChains(chainsResponse.data || []);
          } else {
            setChains([]);
          }
          // Load user's clips
          const clipsResponse = await apiService.getUserClips();
          if (clipsResponse.success) {
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
          } else {
            setClips([]);
          }
        } else {
          setError('User not authenticated');
        }
      } catch (error) {
        setError('Error loading data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, user]);

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
      
      if (sortField === 'inChain') {
        // Clips asignados a una chain primero, luego por nombre de chain
        const getChainName = (clip) => {
          const parentChain = chains.find(chain => {
            if (!chain.clips || !Array.isArray(chain.clips)) return false;
            return chain.clips.some(clipItem => {
              let chainClipId = clipItem;
              if (typeof clipItem === 'object' && clipItem.clip) chainClipId = clipItem.clip;
              if (typeof chainClipId === 'object' && chainClipId._id) chainClipId = chainClipId._id;
              return chainClipId && chainClipId.toString() === clip._id.toString();
            });
          });
          return parentChain ? parentChain.name.toLowerCase() : '';
        };
        const aHasChain = !!getChainName(a);
        const bHasChain = !!getChainName(b);
        if (aHasChain && !bHasChain) return sortDirection === 'asc' ? -1 : 1;
        if (!aHasChain && bHasChain) return sortDirection === 'asc' ? 1 : -1;
        // Ambos tienen o no tienen chain, ordenar por nombre de chain
        aValue = getChainName(a);
        bValue = getChainName(b);
      } else if (sortField === 'createdAt') {
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

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'chain') {
        await apiService.deleteChain(deleteTarget.id);
        setChains(prev => prev.filter(c => c._id !== deleteTarget.id));
      } else if (deleteTarget.type === 'clip') {
        await apiService.deleteClip(deleteTarget.id);
        setClips(prev => prev.filter(c => c._id !== deleteTarget.id));
      }
      setNotification({
        isVisible: true,
        type: 'success',
        title: 'Deleted',
        message: `${deleteTarget.type === 'chain' ? 'Chain' : 'Clip'} deleted successfully.`
      });
      setShowDeleteModal(false);
    } catch (err) {
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Error',
        message: 'Error deleting. Please try again.'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
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

          <AppNotification
            isVisible={notification.isVisible}
            onClose={() => setNotification(n => ({ ...n, isVisible: false }))}
            type={notification.type}
            title={notification.title}
            message={notification.message}
          />
          {showDeleteModal && deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h2>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this {deleteTarget.type}? <br/>
                  <span className="font-medium">{deleteTarget.name}</span>
                  <br/>
                  <span className="text-red-600 font-medium">This action cannot be undone.</span>
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
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
                    onClick={() => handleTabChange('chains')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'chains'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Chains ({chains.length})
                  </button>
                  <button
                    onClick={() => handleTabChange('clips')}
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
                                <FolderPlusIcon className="w-5 h-5 text-gray-900 mr-2 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {chain.name}
                                </span>
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
                                  onClick={() => {
                                    setDeleteTarget({ type: 'chain', id: chain._id, name: chain.name });
                                    setShowDeleteModal(true);
                                  }}
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => handleSort('inChain')}>
                            <div className="flex items-center space-x-1">
                              <span>In Chain</span>
                              <SortIcon field="inChain" />
                            </div>
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
                                <PlayCircleIcon className="w-5 h-5 text-gray-900 mr-2 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {clip.title}
                                </span>
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
                                  onClick={() => {
                                    setDeleteTarget({ type: 'clip', id: clip._id, name: clip.title });
                                    setShowDeleteModal(true);
                                  }}
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

// Component to display chain status for a clip
const ChainStatusCell = ({ clip, chains }) => {
  // Find which chain this clip belongs to
  const parentChain = chains.find(chain => {
    if (!chain.clips || !Array.isArray(chain.clips)) {
      return false;
    }
    return chain.clips.some(clipItem => {
      let chainClipId = clipItem;
      if (typeof clipItem === 'object' && clipItem.clip) {
        chainClipId = clipItem.clip;
      }
      if (typeof chainClipId === 'object' && chainClipId._id) {
        chainClipId = chainClipId._id;
      }
      return chainClipId && chainClipId.toString() === clip._id.toString();
    });
  });

  if (!parentChain) {
    return (
      <div className="flex items-center space-x-2">
        <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 truncate" title="Unassigned">
          Unassigned
        </span>
      </div>
    );
  }

  return (
    <Link
      to={`/edit-chain/${parentChain._id}`}
      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 max-w-[180px] truncate"
      title={parentChain.name}
    >
      <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span className="truncate">{parentChain.name}</span>
    </Link>
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </Link>
  );
};

export default Workspace;
