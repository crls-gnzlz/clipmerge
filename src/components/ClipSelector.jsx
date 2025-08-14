import React, { useState, useEffect } from 'react';
import apiService from '../lib/api.js';
import { mockClips, getMockClipsSorted } from '../data/mockClips.js';

const ClipSelector = ({ onAddClips, existingClipIds = [], useMockData = false }) => {
  const [availableClips, setAvailableClips] = useState([]);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter clips based on search
  const filteredClips = availableClips.filter(clip => {
    const matchesSearch = clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (clip.description && clip.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
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

  // Add selected clips to chain
  const handleAddClips = () => {
    const clipsToAdd = availableClips.filter(clip => selectedClips.includes(clip._id));
    onAddClips(clipsToAdd);
    setSelectedClips([]);
    setSearchTerm('');
  };

  if (isLoading) {
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

  if (availableClips.length === 0) {
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
        <h4 className="text-xs font-medium text-gray-700">Available Clips</h4>
        <div className="flex items-center space-x-2">
          {useMockData && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Mock Data
            </span>
          )}
          <span className="text-xs text-gray-500">
            {selectedClips.length} of {filteredClips.length} selected
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search clips by title or description..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Clips List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredClips.map(clip => (
          <div
            key={clip._id}
            className={`
              relative group border border-gray-200 rounded-lg p-3 cursor-pointer
              transition-all duration-200 hover:border-gray-300 hover:shadow-sm
              ${selectedClips.includes(clip._id) 
                ? 'border-primary-300 bg-primary-50' 
                : 'bg-white'
              }
            `}
            onClick={() => toggleClipSelection(clip._id)}
          >
            {/* Checkbox */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className={`
                w-4 h-4 rounded border-2 flex items-center justify-center
                transition-all duration-200
                ${selectedClips.includes(clip._id)
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
                }
              `}>
                {selectedClips.includes(clip._id) && (
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
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xs text-gray-500">
                  {Math.floor((clip.duration || (clip.endTime - clip.startTime)) / 60)}:
                  {((clip.duration || (clip.endTime - clip.startTime)) % 60).toString().padStart(2, '0')}
                </span>
                {clip.tags && clip.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {clip.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
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
                )}
                <span className="text-xs text-gray-400">
                  {new Date(clip.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      {selectedClips.length > 0 && (
        <button
          type="button"
          onClick={handleAddClips}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
        >
          Add {selectedClips.length} clip{selectedClips.length !== 1 ? 's' : ''} to Chain
        </button>
      )}
    </div>
  );
};

export default ClipSelector;
