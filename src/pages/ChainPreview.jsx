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

  // Function to extract video ID from YouTube URL
  const extractVideoId = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    console.warn('🔍 ChainPreview: Could not extract videoId from URL:', url);
    return null;
  };

  // Utilidad para obtener videoId de un clip
  const getVideoIdFromClip = (clip) => {
    if (clip.videoUrl) {
      const id = extractVideoId(clip.videoUrl);
      if (id) return id;
    }
    if (clip.videoId) return clip.videoId;
    return null;
  };

  useEffect(() => {
    const loadChainData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isAuthenticated && user) {
          // Real API call
          if (!chainId || typeof chainId !== 'string' || chainId.trim() === '') {
            setError('Invalid chain ID format');
            setIsLoading(false);
            return;
          }
          try {
            const chainResponse = await apiService.getChainById(chainId.trim());
            if (chainResponse.success) {
              const chainData = chainResponse.data;
              // Extract clips from chain
              const chainClips = [];
              if (chainData.clips && Array.isArray(chainData.clips)) {
                for (const clipItem of chainData.clips) {
                  try {
                    if (clipItem && typeof clipItem === 'object' && clipItem._id) {
                      if (clipItem.clip && typeof clipItem.clip === 'object') {
                        const actualClip = {
                          ...clipItem.clip,
                          order: clipItem.order,
                          transition: clipItem.transition,
                          transitionDuration: clipItem.transitionDuration,
                          chainClipId: clipItem._id,
                          videoId: getVideoIdFromClip(clipItem.clip)
                        };
                        chainClips.push(actualClip);
                      } else {
                        const actualClip = {
                          ...clipItem,
                          videoId: getVideoIdFromClip(clipItem)
                        };
                        chainClips.push(actualClip);
                      }
                    } else if (clipItem && typeof clipItem === 'string' && clipItem.trim().length > 0) {
                      const clipResponse = await apiService.getClipById(clipItem.trim());
                      if (clipResponse.success) {
                        const actualClip = {
                          ...clipResponse.data,
                          videoId: getVideoIdFromClip(clipResponse.data)
                        };
                        chainClips.push(actualClip);
                      }
                    } else if (clipItem && clipItem.clip && typeof clipItem.clip === 'string') {
                      const clipResponse = await apiService.getClipById(clipItem.clip.trim());
                      if (clipResponse.success) {
                        const actualClip = {
                          ...clipResponse.data,
                          videoId: getVideoIdFromClip(clipResponse.data)
                        };
                        chainClips.push(actualClip);
                      }
                    }
                  } catch (clipError) {
                    // Continue with other clips instead of failing completely
                  }
                }
              }
              setChain(chainData);
              setClips(chainClips);
            } else {
              setError(`Failed to load chain: ${chainResponse.message}`);
            }
          } catch (chainError) {
            setError(`Error loading chain: ${chainError.message}`);
            return;
          }
        } else {
          setError('User not authenticated');
          return;
        }
      } catch (error) {
        setError('Error loading chain data');
      } finally {
        setIsLoading(false);
      }
    };
    loadChainData();
  }, [chainId, isAuthenticated, user]);

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
                  onClick={() => navigate('/workspace')}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200"
                >
                  Go to Workspace
                </button>
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
                    <span>By {typeof chain.author === 'object' ? chain.author.displayName || chain.author.username || 'Unknown' : chain.author || 'Unknown'}</span>
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
                    onClick={() => navigate('/workspace')}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    Back to Workspace
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
                author={typeof chain.author === 'object' ? chain.author.displayName || chain.author.username || 'Unknown' : chain.author || 'Unknown'}
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
