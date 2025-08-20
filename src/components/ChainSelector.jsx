import React, { useState, useEffect } from 'react';
import apiService from '../lib/api.js';

const ChainSelector = ({ onChainSelected, onClose }) => {
  const [userChains, setUserChains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChainId, setSelectedChainId] = useState('');
  const [error, setError] = useState('');

  // Fetch user chains on mount
  useEffect(() => {
    const fetchUserChains = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getUserChains();
        if (response.success) {
          setUserChains(response.data || []);
        } else {
          setError('Failed to load chains');
        }
      } catch (error) {
        console.error('Error fetching user chains:', error);
        setError('Error loading chains');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserChains();
  }, []);

  const handleChainSelection = () => {
    if (!selectedChainId) {
      setError('Please select a chain');
      return;
    }
    
    const selectedChain = userChains.find(chain => chain._id === selectedChainId);
    if (selectedChain) {
      onChainSelected(selectedChain);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading chains...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="text-red-600 text-sm mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (userChains.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No chains available</h3>
        <p className="mt-1 text-xs text-gray-500">
          You don't have any chains yet. Create a chain first to add clips to it.
        </p>
        <div className="mt-4">
          <button
            onClick={() => {
              onClose();
              window.location.href = '/create-chain';
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors duration-200"
          >
            Create Chain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {userChains.map(chain => (
          <label key={chain._id} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="radio"
              name="chainSelection"
              value={chain._id}
              checked={selectedChainId === chain._id}
              onChange={(e) => setSelectedChainId(e.target.value)}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">{chain.name}</span>
              {chain.description && (
                <p className="text-xs text-gray-500">{chain.description}</p>
              )}
              <span className="text-xs text-gray-400">
                {chain.clips ? chain.clips.length : 0} clips
              </span>
            </div>
          </label>
        ))}
      </div>
      
      {error && (
        <div className="text-red-600 text-xs text-center">{error}</div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleChainSelection}
          disabled={!selectedChainId}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          Add to Chain
        </button>
      </div>
    </div>
  );
};

export default ChainSelector;
