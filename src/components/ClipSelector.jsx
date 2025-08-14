import React, { useState, useEffect } from 'react';
import apiService from '../lib/api.js';
import { mockClips, getMockClipsSorted } from '../data/mockClips.js';

const EnhancedClipSelector = ({ onAddClips, existingClipIds = [], useMockData = false }) => {
  const [availableClips, setAvailableClips] = useState([]);
  const [userChains, setUserChains] = useState([]);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChains, setIsLoadingChains] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'chains'
  const [expandedChains, setExpandedChains] = useState(new Set());

  // Fetch available clips (not assigned to any chain)
  useEffect(() => {
    const fetchAvailableClips = async () => {
      try {
        setIsLoading(true);
        
        if (useMockData) {
          // Use mock data for testing
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
          
          // Filter out clips that are already in chains
          const available = getMockClipsSorted().filter(clip => 
            !existingClipIds.includes(clip._id)
          );
          
          setAvailableClips(available);
        } else {
          // Use real API
          const response = await apiService.getUserClips();
          
          if (response.success) {
            // Filter out clips that are already in chains
            const available = (response.data || []).filter(clip => 
              !existingClipIds.includes(clip._id)
            );
            
            // Sort by most recent first
            const sorted = available.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            setAvailableClips(sorted);
          }
        }
      } catch (error) {
        console.error('Error fetching available clips:', error);
        
        // Fallback to mock data if API fails
        if (!useMockData) {
          console.log('Falling back to mock data due to API error');
          const available = getMockClipsSorted().filter(clip => 
            !existingClipIds.includes(clip._id)
          );
          setAvailableClips(available);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableClips();
  }, [existingClipIds, useMockData]);

  // Fetch user chains for reusing clips
  useEffect(() => {
    const fetchUserChains = async () => {
      try {
        setIsLoadingChains(true);
        
        if (useMockData) {
          // Use mock data for testing
          await new Promise(resolve => setTimeout(resolve, 300));
          // For mock data, we'll create some sample chains
          setUserChains([
            {
              _id: 'mock-chain-1',
              name: 'Sample Chain 1',
              clips: [
                { clip: { _id: 'mock-clip-1', title: 'Sample Clip 1', description: 'From chain 1' }, order: 0 },
                { clip: { _id: 'mock-clip-2', title: 'Sample Clip 2', description: 'From chain 1' }, order: 1 }
              ]
            },
            {
              _id: 'mock-chain-2',
              name: 'Sample Chain 2',
              clips: [
                { clip: { _id: 'mock-clip-3', title: 'Sample Clip 3', description: 'From chain 2' }, order: 0 }
              ]
            }
          ]);
        } else {
          // Use real API
          const response = await apiService.getUserChains();
          
          if (response.success) {
            // Only show chains that have clips
            const chainsWithClips = (response.data || []).filter(chain => 
              chain.clips && chain.clips.length > 0
            );
            
            setUserChains(chainsWithClips);
          }
        }
      } catch (error) {
        console.error('Error fetching user chains:', error);
        setUserChains([]);
      } finally {
        setIsLoadingChains(false);
      }
    };

    fetchUserChains();
  }, [useMockData]);

  // Filter clips based on search
  const filteredAvailableClips = availableClips.filter(clip => {
    const matchesSearch = clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (clip.description && clip.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Filter chains based on search
  const filteredChains = userChains.filter(chain => {
    const matchesSearch = chain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chain.clips.some(clipItem => 
                           clipItem.clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (clipItem.clip.description && clipItem.clip.description.toLowerCase().includes(searchTerm.toLowerCase()))
                         );
    
    return matchesSearch;
  });

  // Handle clip selection
  const toggleClipSelection = (clipId) => {
    setSelectedClips(prev => {
      if (prev.includes(clipId)) {
        return prev.filter(id => id !== clipId);
      } else {
        return [...prev, clipId];
      }
    });
  };

  // Toggle chain expansion
  const toggleChainExpansion = (chainId) => {
    setExpandedChains(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chainId)) {
        newSet.delete(chainId);
      } else {
        newSet.add(chainId);
      }
      return newSet;
    });
  };

  // Add selected clips to chain
  const handleAddClips = () => {
    const clipsToAdd = [];
    
    // Get clips from available clips
    const availableClipsToAdd = availableClips.filter(clip => selectedClips.includes(clip._id));
    clipsToAdd.push(...availableClipsToAdd);
    
    // Get clips from chains
    userChains.forEach(chain => {
      chain.clips.forEach(clipItem => {
        if (selectedClips.includes(clipItem.clip._id)) {
          clipsToAdd.push(clipItem.clip);
        }
      });
    });
    
    onAddClips(clipsToAdd);
    setSelectedClips([]);
    setSearchTerm('');
  };

  if (isLoading && isLoadingChains) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasAvailableClips = availableClips.length > 0;
  const hasChainsWithClips = userChains.length > 0;

  if (!hasAvailableClips && !hasChainsWithClips) {
    return (
      <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">No clips available</h3>
        <p className="text-gray-500 text-xs">
          All your clips are already assigned to chains or you haven't created any clips yet
        </p>
        {useMockData && (
          <p className="text-xs text-blue-600 mt-2">
            Using mock data for testing
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-gray-700">Select Clips</h4>
        <div className="flex items-center space-x-2">
          {useMockData && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Mock Data
            </span>
          )}
          <span className="text-xs text-gray-500">
            {selectedClips.length} selected
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search clips by title, description, or chain name..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {hasAvailableClips && (
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              activeTab === 'available'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
              </svg>
              <span>Available Clips</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {filteredAvailableClips.length}
              </span>
            </div>
          </button>
        )}
        
        {hasChainsWithClips && (
          <button
            onClick={() => setActiveTab('chains')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              activeTab === 'chains'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>From Chains</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {filteredChains.length}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Content based on active tab */}
      <div className="max-h-64 overflow-y-auto">
        {activeTab === 'available' && hasAvailableClips && (
          <div className="space-y-2">
            {filteredAvailableClips.map(clip => (
              <ClipItem
                key={clip._id}
                clip={clip}
                isSelected={selectedClips.includes(clip._id)}
                onToggle={() => toggleClipSelection(clip._id)}
                showChainInfo={false}
              />
            ))}
          </div>
        )}

        {activeTab === 'chains' && hasChainsWithClips && (
          <div className="space-y-3">
            {filteredChains.map(chain => (
              <ChainClipGroup
                key={chain._id}
                chain={chain}
                selectedClips={selectedClips}
                onToggleClip={toggleClipSelection}
                isExpanded={expandedChains.has(chain._id)}
                onToggleExpansion={() => toggleChainExpansion(chain._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleAddClips}
          disabled={selectedClips.length === 0}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          Add {selectedClips.length > 0 ? `${selectedClips.length} ` : ''}Clip{selectedClips.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

// Individual clip item component
const ClipItem = ({ clip, isSelected, onToggle, showChainInfo = false }) => (
  <div
    className={`
      relative group border border-gray-200 rounded-lg p-3 cursor-pointer
      transition-all duration-200 hover:border-gray-300 hover:shadow-sm
      ${isSelected 
        ? 'border-primary-300 bg-primary-50' 
        : 'bg-white'
      }
    `}
    onClick={onToggle}
  >
    {/* Checkbox */}
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
      <div className={`
        w-4 h-4 rounded border-2 flex items-center justify-center
        transition-all duration-200
        ${isSelected
          ? 'border-primary-500 bg-primary-500'
          : 'border-gray-300'
        }
      `}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>

    {/* Clip Content */}
    <div className="pl-8">
      <h5 className="text-sm font-medium text-gray-900 truncate">
        {clip.title}
      </h5>
      {clip.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {clip.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Duration: {clip.duration || 'Unknown'}</span>
          {clip.tags && clip.tags.length > 0 && (
            <span>• Tags: {clip.tags.slice(0, 2).join(', ')}{clip.tags.length > 2 ? ` +${clip.tags.length - 2}` : ''}</span>
          )}
        </div>
        {showChainInfo && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            From Chain
          </span>
        )}
      </div>
    </div>
  </div>
);

// Chain with clips group component
const ChainClipGroup = ({ chain, selectedClips, onToggleClip, isExpanded, onToggleExpansion }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    {/* Chain Header */}
    <div
      className="bg-gray-50 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={onToggleExpansion}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h5 className="text-sm font-medium text-gray-900">{chain.name}</h5>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {chain.clips.length} clip{chain.clips.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {chain.clips.filter(clipItem => selectedClips.includes(clipItem.clip._id)).length} selected
        </div>
      </div>
    </div>

    {/* Chain Clips */}
    {isExpanded && (
      <div className="bg-white border-t border-gray-200">
        <div className="space-y-1 p-2">
          {chain.clips.map((clipItem, index) => (
            <ClipItem
              key={clipItem.clip._id}
              clip={clipItem.clip}
              isSelected={selectedClips.includes(clipItem.clip._id)}
              onToggle={() => onToggleClip(clipItem.clip._id)}
              showChainInfo={true}
            />
          ))}
        </div>
      </div>
    )}
  </div>
);

export default EnhancedClipSelector;
