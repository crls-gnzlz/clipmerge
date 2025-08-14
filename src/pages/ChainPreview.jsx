import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import ClipChainPlayer from '../components/ClipChainPlayer.jsx';
import apiService from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const ChainPreview = () => {
  const { chainId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [chain, setChain] = useState(null);
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const loadChainData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (useMockData) {
          // Mock data for testing
          await new Promise(resolve => setTimeout(resolve, 500));
          setChain({
            _id: 'mock-chain-1',
            name: 'Sample Chain for Preview',
            description: 'This is a sample chain to test the preview functionality',
            author: user?.username || 'test_user',
            createdAt: new Date().toISOString(),
            tags: ['sample', 'preview', 'test'],
            isPublic: true
          });
          setClips([
            {
              _id: 'mock-clip-1',
              title: 'Sample Clip 1',
              description: 'This is a sample clip for preview',
              videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
              startTime: 0,
              endTime: 30,
              duration: 30
            },
            {
              _id: 'mock-clip-2',
              title: 'Sample Clip 2',
              description: 'Another sample clip for preview',
              videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
              startTime: 30,
              endTime: 60,
              duration: 30
            }
          ]);
        } else {
          // Real API call
          if (isAuthenticated && user) {
            console.log('🔍 ChainPreview: Loading real chain data for ID:', chainId);
            console.log('🔍 ChainPreview: Chain ID type:', typeof chainId);
            console.log('🔍 ChainPreview: Chain ID value:', chainId);
            
            // Validate chain ID format
            if (!chainId || typeof chainId !== 'string' || chainId.trim() === '') {
              console.error('❌ ChainPreview: Invalid chain ID format:', chainId);
              setError('Invalid chain ID format');
              setIsLoading(false);
              return;
            }
            
            // Get chain data
            try {
              const chainResponse = await apiService.getChainById(chainId.trim());
              if (chainResponse.success) {
                const chainData = chainResponse.data;
                console.log('✅ ChainPreview: Chain loaded:', chainData);
                console.log('🔍 ChainPreview: Chain clips array:', chainData.clips);
                console.log('🔍 ChainPreview: Chain data structure:', JSON.stringify(chainData, null, 2));
                
                // Extract clips from chain
                const chainClips = [];
                if (chainData.clips && Array.isArray(chainData.clips)) {
                  console.log('🔍 ChainPreview: Processing', chainData.clips.length, 'clips');
                  for (const clipItem of chainData.clips) {
                    try {
                      console.log('🔍 ChainPreview: Processing clip item:', clipItem);
                      
                      let clipData = null;
                      
                      if (typeof clipItem === 'string') {
                        // Case 1: clipItem is just the ID
                        console.log('🔍 ChainPreview: Clip item is ID string:', clipItem);
                        if (clipItem.trim().length > 0) {
                          console.log('🔍 ChainPreview: Fetching clip by ID:', clipItem);
                          const clipResponse = await apiService.getClipById(clipItem.trim());
                          if (clipResponse.success) {
                            clipData = clipResponse.data;
                            console.log('✅ ChainPreview: Clip loaded by ID successfully:', clipData);
                          } else {
                            console.warn('⚠️ ChainPreview: Failed to load clip by ID:', clipItem, clipResponse.message);
                          }
                        } else {
                          console.warn('⚠️ ChainPreview: Empty clip ID string');
                        }
                      } else if (clipItem && typeof clipItem === 'object') {
                        // Case 2: clipItem is the complete clip object
                        if (clipItem._id) {
                          console.log('🔍 ChainPreview: Clip item is complete object with ID:', clipItem._id);
                          clipData = clipItem;
                          console.log('✅ ChainPreview: Using embedded clip data:', clipData);
                        } else if (clipItem.clip && typeof clipItem.clip === 'string') {
                          // Case 3: clipItem has a clip property with ID
                          console.log('🔍 ChainPreview: Clip item has clip property with ID:', clipItem.clip);
                          if (clipItem.clip.trim().length > 0) {
                            console.log('🔍 ChainPreview: Fetching clip by clip property ID:', clipItem.clip);
                            const clipResponse = await apiService.getClipById(clipItem.clip.trim());
                            if (clipResponse.success) {
                              clipData = clipResponse.data;
                              console.log('✅ ChainPreview: Clip loaded by clip property ID successfully:', clipData);
                            } else {
                              console.warn('⚠️ ChainPreview: Failed to load clip by clip property ID:', clipItem.clip, clipResponse.message);
                            }
                          } else {
                            console.warn('⚠️ ChainPreview: Empty clip property ID');
                          }
                        } else {
                          console.warn('⚠️ ChainPreview: Clip item object has no _id or clip property:', clipItem);
                        }
                      } else {
                        console.warn('⚠️ ChainPreview: Invalid clip item format:', clipItem);
                      }
                      
                      // Add clip to the list if we have valid data
                      if (clipData) {
                        chainClips.push(clipData);
                      }
                      
                    } catch (clipError) {
                      console.error('❌ ChainPreview: Error processing clip item:', clipError);
                      // Continue with other clips instead of failing completely
                    }
                  }
                } else {
                  console.log('🔍 ChainPreview: No clips array found in chain data');
                }
                
                setChain(chainData);
                setClips(chainClips);
                console.log('✅ ChainPreview: Clips loaded:', chainClips.length);
              } else {
                console.warn('⚠️ ChainPreview: Failed to load chain:', chainResponse.message);
                setError(`Failed to load chain: ${chainResponse.message}`);
              }
            } catch (chainError) {
              console.error('❌ ChainPreview: Error loading chain:', chainError);
              setError(`Error loading chain: ${chainError.message}`);
              
              // Fallback to mock data if API fails
              console.log('🔄 ChainPreview: Falling back to mock data due to API error');
              setUseMockData(true);
              return; // This will trigger the mock data loading
            }
          } else {
            console.log('ℹ️ ChainPreview: User not authenticated, using mock data');
            setUseMockData(true);
            return; // This will trigger the mock data loading
          }
        }
      } catch (error) {
        console.error('❌ ChainPreview: Error loading chain data:', error);
        setError('Error loading chain data');
      } finally {
        setIsLoading(false);
      }
    };

    loadChainData();
  }, [chainId, useMockData, isAuthenticated, user]);

  if (isLoading) {
    return (
      <LayoutWithSidebar>
        <div className="min-h-full bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LayoutWithSidebar>
    );
  }

  if (error || !chain) {
    return (
      <LayoutWithSidebar>
        <div className="min-h-full bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {error ? 'Error Loading Chain' : 'Chain Not Found'}
              </h1>
              <p className="text-gray-600 mb-6">
                {error || 'The chain you\'re looking for doesn\'t exist or you don\'t have access to it.'}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200"
                >
                  Go to Dashboard
                </button>
                {useMockData && (
                  <button
                    onClick={() => setUseMockData(false)}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    Try Real Data
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </LayoutWithSidebar>
    );
  }

  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-light text-gray-900 mb-2">
                  Chain Preview
                </h1>
                <p className="text-sm text-gray-500 font-light">
                  Preview how your chain will look when shared
                </p>
              </div>
              
              {/* Data Source Indicator */}
              <div className="flex items-center space-x-2">
                {useMockData ? (
                  <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                    🎭 Mock Data
                  </span>
                ) : (
                  <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    📡 Live Data
                  </span>
                )}
                
                <button
                  onClick={() => setUseMockData(!useMockData)}
                  className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  Toggle
                </button>
              </div>
            </div>
            
            {/* Chain Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {chain.name}
                  </h2>
                  {chain.description && (
                    <p className="text-gray-600 mb-3">
                      {chain.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>By {chain.author || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(chain.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{clips.length} clip{clips.length !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      chain.isPublic 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {chain.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  {chain.tags && chain.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {chain.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/edit-chain/${chain._id}`)}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200"
                  >
                    Edit Chain
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Preview Player
              </h3>
              <p className="text-sm text-gray-500">
                This is how your chain will appear to others when shared
              </p>
            </div>
            
            {clips.length > 0 ? (
              <ClipChainPlayer
                id={chain._id}
                title={chain.name}
                description={chain.description || ''}
                clips={clips}
                author={chain.author || 'Unknown'}
                createdAt={chain.createdAt}
                tags={chain.tags || []}
              />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clips in this chain</h3>
                <p className="text-gray-500 mb-4">
                  Add some clips to see how your chain will look
                </p>
                <button
                  onClick={() => navigate(`/edit-chain/${chain._id}`)}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200"
                >
                  Add Clips
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
};

export default ChainPreview;
