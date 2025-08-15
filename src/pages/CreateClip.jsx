import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import SelectField from '../components/SelectField.jsx';
import apiService from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const CreateClip = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    startTime: '',
    endTime: ''
  });
  
  const [videoDuration, setVideoDuration] = useState(null);
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [videoId, setVideoId] = useState(null);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const [createAnother, setCreateAnother] = useState(false);
  
  // New state for chain selection
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [userChains, setUserChains] = useState([]);
  const [selectedChainId, setSelectedChainId] = useState('');
  const [isLoadingChains, setIsLoadingChains] = useState(false);

  // Refs
  const iframeRef = useRef(null);
  const playerContainerRef = useRef(null);
  const overlayRef = useRef(null);
  const timerRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const playerRef = useRef(null);

  // Load YouTube IFrame API
  useEffect(() => {
    console.log('🔍 CreateClip: Loading YouTube IFrame API...');
    
    if (!window.YT) {
      console.log('🔍 CreateClip: YouTube API not found, loading script...');
      
      // Create global callback for YouTube API
      window.onYouTubeIframeAPIReady = () => {
        console.log('✅ CreateClip: YouTube IFrame API ready!');
        console.log('🔍 CreateClip: YT object available:', window.YT);
        console.log('🔍 CreateClip: YT.Player available:', window.YT.Player);
      };
      
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      console.log('🔍 CreateClip: YouTube script tag added to DOM');
    } else {
      console.log('✅ CreateClip: YouTube API already available');
      console.log('🔍 CreateClip: YT object:', window.YT);
      console.log('🔍 CreateClip: YT.Player available:', window.YT.Player);
    }
  }, []);

  // Load user chains when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserChains();
    }
  }, [isAuthenticated, user]);

  // Load user chains
  const loadUserChains = async () => {
    try {
      setIsLoadingChains(true);
      const response = await apiService.getUserChains();
      if (response.success) {
        setUserChains(response.data || []);
        console.log('✅ CreateClip: User chains loaded:', response.data?.length || 0);
      } else {
        console.warn('⚠️ CreateClip: Failed to load user chains:', response.message);
        setUserChains([]);
      }
    } catch (error) {
      console.error('❌ CreateClip: Error loading user chains:', error);
      setUserChains([]);
    } finally {
      setIsLoadingChains(false);
    }
  };



  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  // Convert time string to seconds
  const timeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  // Convert seconds to time string
  const secondsToTime = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Detect video duration from URL
  const detectVideoDuration = async (url) => {
    if (!url) return;
    
    try {
      setIsLoading(true);
      console.log('🔍 CreateClip: Starting video duration detection for URL:', url);
      
      const extractedId = extractVideoId(url);
      console.log('🔍 CreateClip: Extracted video ID:', extractedId);
      
      if (extractedId) {
        setVideoId(extractedId);
        console.log('✅ CreateClip: videoId state updated to:', extractedId);
      } else {
        console.warn('⚠️ CreateClip: Could not extract video ID from URL');
      }
      
      const response = await apiService.analyzeVideo(url);
      if (response.success && response.data) {
        const metadata = response.data;
        setVideoDuration(metadata.duration);
        setVideoMetadata(metadata);
        setFormData(prev => ({ 
          ...prev, 
          videoUrl: url
        }));
        
        console.log('✅ CreateClip: Video metadata received:', metadata);
        console.log('✅ CreateClip: Video duration set to:', metadata.duration);
      } else {
        console.warn('⚠️ CreateClip: Video analysis failed:', response.message);
      }
    } catch (error) {
      console.error('❌ CreateClip: Error detecting video duration:', error);
      setVideoDuration(300);
      setFormData(prev => ({ ...prev, videoUrl: url }));
      setVideoMetadata(null);
    } finally {
      setIsLoading(false);
      console.log('🔍 CreateClip: Video duration detection completed');
    }
  };



  // Validate time format (MM:SS or HH:MM:SS)
  const validateTimeFormat = (timeStr) => {
    if (!timeStr) return { isValid: false, message: 'Time is required' };
    
    const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    const match = timeStr.match(timePattern);
    
    if (!match) {
      return { isValid: false, message: 'Invalid format. Use MM:SS or HH:MM:SS' };
    }
    
    const hours = match[3] ? parseInt(match[1]) : 0;
    const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1]);
    const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2]);
    
    if (minutes >= 60 || seconds >= 60) {
      return { isValid: false, message: 'Invalid time values (minutes/seconds must be < 60)' };
    }
    
    if (hours >= 24) {
      return { isValid: false, message: 'Hours cannot exceed 23' };
    }
    
    return { isValid: true, message: '' };
  };

  // Validate time range
  const validateTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return { isValid: true, message: '' };
    
    const startValidation = validateTimeFormat(startTime);
    const endValidation = validateTimeFormat(endTime);
    
    if (!startValidation.isValid || !endValidation.isValid) {
      return { isValid: true, message: '' }; // Let individual field validation handle this
    }
    
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);
    
    if (startSeconds >= endSeconds) {
      return { isValid: false, message: 'End time must be greater than start time' };
    }
    
    if (videoDuration && endSeconds > videoDuration) {
      return { isValid: false, message: `End time cannot exceed video duration (${secondsToTime(videoDuration)})` };
    }
    
    // Check if clip duration is reasonable (at least 1 second, not too long)
    const clipDuration = endSeconds - startSeconds;
    if (clipDuration < 1) {
      return { isValid: false, message: 'Clip must be at least 1 second long' };
    }
    
    if (clipDuration > 600) { // 10 minutes max
      return { isValid: false, message: 'Clip cannot exceed 10 minutes' };
    }
    
    return { isValid: true, message: '' };
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.videoUrl) {
      newErrors.videoUrl = 'Video URL is required';
    }
    
    // Validate start time
    const startTimeValidation = validateTimeFormat(formData.startTime);
    if (!startTimeValidation.isValid) {
      newErrors.startTime = startTimeValidation.message;
    }
    
    // Validate end time
    const endTimeValidation = validateTimeFormat(formData.endTime);
    if (!endTimeValidation.isValid) {
      newErrors.endTime = endTimeValidation.message;
    }
    
    // Validate time range if both times are valid
    if (startTimeValidation.isValid && endTimeValidation.isValid) {
      const rangeValidation = validateTimeRange(formData.startTime, formData.endTime);
      if (!rangeValidation.isValid) {
        newErrors.endTime = rangeValidation.message;
      }
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setErrors({});
      
      const clipData = {
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        startTime: timeToSeconds(formData.startTime),
        endTime: timeToSeconds(formData.endTime)
      };
      
      console.log('🚀 CreateClip: Creating clip with data:', clipData);
      
      const response = await apiService.createClip(clipData);
      
      if (response.success) {
        console.log('✅ CreateClip: Clip created successfully');
        
        if (createAnother) {
          // Reset form but keep video
          setFormData(prev => ({
            ...prev,
            title: '',
            description: '',
            startTime: '',
            endTime: ''
          }));
          setErrors({});
          setErrors({ submit: 'Clip created successfully! Form reset for another clip.' });
        } else {
          // Navigate to workspace
          navigate('/workspace');
        }
      } else {
        setErrors({ submit: response.message || 'Failed to create clip' });
      }
    } catch (error) {
      console.error('Error creating clip:', error);
      setErrors({ submit: error.message || 'An error occurred while creating the clip' });
    } finally {
      setIsLoading(false);
    }
  };

  // Create clip and associate with chain
  const handleCreateAndChain = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setErrors({});
      
      const clipData = {
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        startTime: timeToSeconds(formData.startTime),
        endTime: timeToSeconds(formData.endTime)
      };
      
      console.log('🚀 CreateClip: Creating clip and associating with chain:', clipData);
      console.log('🔍 CreateClip: Selected chain ID:', selectedChainId);
      
      // First create the clip
      const clipResponse = await apiService.createClip(clipData);
      
      if (clipResponse.success) {
        console.log('✅ CreateClip: Clip created successfully, associating with chain');
        console.log('🔍 CreateClip: Created clip data:', clipResponse.data);
        
        // Then associate with selected chain
        if (selectedChainId) {
          try {
            console.log('🔍 CreateClip: Adding clip to chain...');
            
            // Use addClipToChain which handles the association internally
            const chainResponse = await apiService.addClipToChain(selectedChainId, clipResponse.data._id);
            
            if (chainResponse.success) {
              console.log('✅ CreateClip: Clip associated with chain successfully');
              console.log('🔍 CreateClip: Chain response:', chainResponse);
              setSuccessMessage('Clip created and associated with chain successfully!');
              setErrors({});
              
              // Reset form but stay on the same page
              // Only clear form data if "same video" is not checked
              if (!createAnother) {
                setFormData({
                  title: '',
                  description: '',
                  videoUrl: '',
                  startTime: '',
                  endTime: '',
                  tags: []
                });
                setVideoId('');
                setVideoDuration(0);
                setVideoMetadata(null);
                setYoutubePlayer(null);
              } else {
                // Keep video data but clear clip-specific fields
                setFormData(prev => ({
                  ...prev,
                  title: '',
                  description: '',
                  startTime: '',
                  endTime: '',
                  tags: []
                }));
              }
              
              // Close the chain selector modal
              setShowChainSelector(false);
              setSelectedChainId('');
              
              // Show success message
              setTimeout(() => {
                setSuccessMessage('');
              }, 3000);
            } else {
              console.warn('⚠️ CreateClip: Clip created but failed to associate with chain:', chainResponse.message);
              setErrors({ submit: 'Clip created but failed to associate with chain. You can add it manually later.' });
            }
          } catch (error) {
            console.error('❌ CreateClip: Error associating clip with chain:', error);
            setErrors({ submit: 'Clip created but failed to associate with chain. You can add it manually later.' });
          }
        } else {
          setErrors({ submit: 'Clip created successfully! Please select a chain to associate it with.' });
        }
      } else {
        setErrors({ submit: clipResponse.message || 'Failed to create clip' });
      }
    } catch (error) {
      console.error('❌ CreateClip: Error creating clip and associating with chain:', error);
      setErrors({ submit: error.message || 'An error occurred while creating the clip' });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy current video time to specified field
  const copyCurrentTime = (field) => {
    console.log('🔍 CreateClip: copyCurrentTime called for field:', field);
    console.log('🔍 CreateClip: youtubePlayer state:', youtubePlayer ? 'Ready' : 'Not ready');
    console.log('🔍 CreateClip: videoId state:', videoId);
    
    if (!youtubePlayer) {
      console.warn('❌ CreateClip: YouTube player not ready yet');
      setErrors(prev => ({ ...prev, [field]: 'YouTube player not ready. Please wait for the video to load.' }));
      return;
    }
    
    if (!videoId) {
      console.warn('❌ CreateClip: No video ID available');
      setErrors(prev => ({ ...prev, [field]: 'No video loaded. Please enter a video URL first.' }));
      return;
    }
    
    try {
      console.log('🔍 CreateClip: Attempting to get current time from YouTube player...');
      
      // Get current time from YouTube player
      const currentTime = youtubePlayer.getCurrentTime();
      console.log('🔍 CreateClip: Current time from player:', currentTime);
      
      if (currentTime !== undefined && currentTime >= 0) {
        const timeString = secondsToTime(Math.floor(currentTime));
        console.log('🔍 CreateClip: Converted time string:', timeString);
        
        handleInputChange(field, timeString);
        
        // Visual feedback - briefly change button text
        const button = document.querySelector(`[data-copy-time="${field}"]`);
        if (button) {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          button.className = button.className.replace('bg-secondary-600', 'bg-green-600');
          
          setTimeout(() => {
            button.textContent = originalText;
            button.className = button.className.replace('bg-green-600', 'bg-secondary-600');
          }, 1000);
        }
        
        console.log('✅ CreateClip: Time copied successfully to', field, ':', timeString);
        
        // Auto-validate the copied time
        setTimeout(() => {
          const timeValidation = validateTimeFormat(timeString);
          if (!timeValidation.isValid) {
            setErrors(prev => ({ ...prev, [field]: timeValidation.message }));
          }
        }, 100);
      } else {
        console.warn('⚠️ CreateClip: Invalid current time from player:', currentTime);
        setErrors(prev => ({ ...prev, [field]: 'Could not get current time from video player.' }));
      }
    } catch (error) {
      console.error('❌ CreateClip: Error getting current time:', error);
      setErrors(prev => ({ ...prev, [field]: 'Error getting current time from video player.' }));
    }
  };

  // Handle YouTube player ready
  const onPlayerReady = (event) => {
    console.log('✅ CreateClip: YouTube player ready event triggered');
    console.log('�� CreateClip: Player event:', event);
    
    // The event.target is the player instance
    const player = event.target;
    console.log('🔍 CreateClip: Player instance:', player);
    
    setYoutubePlayer(player);
    console.log('✅ CreateClip: youtubePlayer state updated');
    
    // Test if player methods are available
    if (player && typeof player.getCurrentTime === 'function') {
      console.log('✅ CreateClip: Player methods are available');
    } else {
      console.warn('⚠️ CreateClip: Player methods not available');
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear previous errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for time fields
    if (field === 'startTime' || field === 'endTime') {
      const timeValidation = validateTimeFormat(value);
      if (!timeValidation.isValid && value) {
        setErrors(prev => ({ ...prev, [field]: timeValidation.message }));
      } else if (timeValidation.isValid) {
        // If both times are valid, validate the range
        const otherField = field === 'startTime' ? 'endTime' : 'startTime';
        const otherValue = formData[otherField];
        
        if (otherValue) {
          const rangeValidation = validateTimeRange(
            field === 'startTime' ? value : otherValue,
            field === 'endTime' ? value : otherValue
          );
          
          if (!rangeValidation.isValid) {
            setErrors(prev => ({ ...prev, endTime: rangeValidation.message }));
          } else {
            // Clear range errors if validation passes
            setErrors(prev => ({ ...prev, endTime: '' }));
          }
        }
      }
    }
  };

  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-left mb-10">
            <h1 className="text-2xl font-light text-gray-900 mb-3">
              Create New Clip
            </h1>
            <p className="text-sm text-gray-500 font-light">
              Extract a specific moment from a video to create a shareable clip
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Video URL Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Video URL
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      onBlur={(e) => detectVideoDuration(e.target.value)}
                      placeholder="https://youtube.com/watch?v=VIDEO_ID"
                      className={`flex-1 px-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        errors.videoUrl ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => detectVideoDuration(formData.videoUrl)}
                      disabled={!formData.videoUrl || isLoading}
                      className="px-5 py-2.5 bg-secondary-600 text-white text-sm rounded-lg hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                  </div>
                  {errors.videoUrl && (
                    <p className="text-red-500 text-xs mt-2">{errors.videoUrl}</p>
                  )}
                  {!errors.videoUrl && !videoDuration && (
                    <p className="text-gray-400 text-xs mt-2">
                      Paste any YouTube URL to analyze video information
                    </p>
                  )}
                  {videoDuration && (
                    <p className="text-primary-600 text-xs mt-2 font-medium">
                      Duration: {secondsToTime(videoDuration)}
                    </p>
                  )}
                  
                  {/* Video Metadata Display */}
                  {isLoading && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                        <div className="text-primary-700 text-sm">Analyzing video...</div>
                      </div>
                    </div>
                  )}
                  
                  {videoMetadata && !isLoading && (
                    <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                                          <h3 className="text-xs font-medium text-gray-700">
                    Video Information
                  </h3>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex space-x-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={videoMetadata.thumbnail} 
                              alt="Video thumbnail"
                              className="w-16 h-12 object-cover rounded-lg shadow-sm border border-gray-200"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                              <div>
                                <span className="text-gray-400 block">Title</span>
                                <p className="text-gray-900 font-medium truncate">{videoMetadata.title}</p>
                              </div>
                              
                              <div>
                                <span className="text-gray-400 block">Channel</span>
                                <p className="text-gray-700 truncate">{videoMetadata.channel}</p>
                              </div>
                              
                              <div>
                                <span className="text-gray-400 block">Duration</span>
                                <p className="text-gray-700">{secondsToTime(videoMetadata.duration)}</p>
                              </div>
                              
                              <div>
                                <span className="text-gray-400 block">Views</span>
                                <p className="text-gray-700">{videoMetadata.viewCount?.toLocaleString() || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="text-xs text-gray-400">ID: {videoMetadata.id}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* More Info - Collapsible */}
                        {(videoMetadata.description || (videoMetadata.tags && videoMetadata.tags.length > 0)) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <details className="group">
                              <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-primary-600 flex items-center">
                                More Info
                                <span className="ml-auto transform group-open:rotate-180 transition-transform text-primary-500">▼</span>
                              </summary>
                              
                              <div className="mt-3 space-y-3">
                                {/* Description */}
                                {videoMetadata.description && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-500 block mb-1">Description</span>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                      {videoMetadata.description}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Tags */}
                                {videoMetadata.tags && videoMetadata.tags.length > 0 && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-500 block mb-1">Tags</span>
                                    <div className="flex flex-wrap gap-1">
                                      {videoMetadata.tags.map((tag, index) => (
                                        <span 
                                          key={index}
                                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* YouTube Player Section */}
              {videoId && (
                <div className="space-y-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Video Player
                  </label>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      ref={iframeRef}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&events=onReady,onStateChange`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => {
                        console.log('🔍 CreateClip: YouTube iframe loaded');
                        // Initialize YouTube player API
                        if (window.YT && window.YT.Player) {
                          console.log('🔍 CreateClip: YouTube API available, creating player instance');
                          const player = new window.YT.Player(iframeRef.current, {
                            events: {
                              onReady: onPlayerReady,
                              onStateChange: (event) => {
                                console.log('🔍 CreateClip: Player state changed:', event.data);
                              }
                            }
                          });
                        } else {
                          console.warn('⚠️ CreateClip: YouTube API not available yet');
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Time Selection Section */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        placeholder="MM:SS or HH:MM:SS"
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                          errors.startTime ? 'border-red-300' : formData.startTime && !errors.startTime ? 'border-green-300' : 'border-gray-200'
                        }`}
                      />
                      {formData.startTime && !errors.startTime && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCurrentTime('startTime')}
                      data-copy-time="startTime"
                      disabled={!videoId || !youtubePlayer}
                      className={`px-3 py-2.5 text-white text-xs rounded-lg transition-all duration-200 font-medium whitespace-nowrap ${
                        !videoId || !youtubePlayer
                          ? 'bg-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-secondary-600 hover:bg-blue-500'
                      }`}
                      title={!videoId ? 'Enter a video URL first' : !youtubePlayer ? 'Video player not ready yet' : 'Copy current video time'}
                    >
                      {!videoId ? 'No Video' : !youtubePlayer ? 'Loading...' : 'Copy Time'}
                    </button>
                  </div>
                  {errors.startTime && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.startTime}
                    </p>
                  )}
                  {!errors.startTime && (
                    <p className="text-gray-400 text-xs mt-2">
                      Format: MM:SS or HH:MM:SS
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        placeholder="MM:SS or HH:MM:SS"
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                          errors.endTime ? 'border-red-300' : formData.endTime && !errors.endTime ? 'border-green-300' : 'border-gray-200'
                        }`}
                      />
                      {formData.endTime && !errors.endTime && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCurrentTime('endTime')}
                      data-copy-time="endTime"
                      disabled={!videoId || !youtubePlayer}
                      className={`px-3 py-2.5 text-white text-xs rounded-lg transition-all duration-200 font-medium whitespace-nowrap ${
                        !videoId || !youtubePlayer
                          ? 'bg-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-secondary-600 hover:bg-blue-500'
                      }`}
                      title={!videoId ? 'Enter a video URL first' : !youtubePlayer ? 'Video player not ready yet' : 'Copy current video time'}
                    >
                      {!videoId ? 'No Video' : !youtubePlayer ? 'Loading...' : 'Copy Time'}
                    </button>
                  </div>
                  {errors.endTime && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.endTime}
                    </p>
                  )}
                  {!errors.endTime && (
                    <p className="text-gray-400 text-xs mt-2">
                      Format: MM:SS or HH:MM:SS
                    </p>
                  )}
                </div>
              </div>
              </div>

              {/* Clip Duration Display */}
              {formData.startTime && formData.endTime && !errors.startTime && !errors.endTime && (
                <div className="text-center p-3 bg-primary-50 border border-primary-100 rounded-lg">
                  <p className="text-primary-600 text-xs font-medium">
                    Clip Duration: {secondsToTime(timeToSeconds(formData.endTime) - timeToSeconds(formData.startTime))}
                  </p>
                </div>
              )}

              {/* Title Section */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a descriptive title for your clip"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-2">{errors.title}</p>
                )}
              </div>

              {/* Description Section */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Add a brief description of your clip..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                />
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className={`border rounded-lg p-4 ${
                  errors.submit.includes('successfully') 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-100'
                }`}>
                  <p className={`text-sm ${
                    errors.submit.includes('successfully') 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-600 font-medium">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Create Another Checkbox */}
              <div className={`flex items-start space-x-3 pt-4 p-3 rounded-lg border transition-all duration-200 ${
                createAnother 
                  ? 'bg-primary-50 border-primary-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center h-5">
                  <input
                    id="create-another"
                    type="checkbox"
                    checked={createAnother}
                    onChange={(e) => setCreateAnother(e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 transition-all duration-200"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="create-another" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Create another clip with the same video
                  </label>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    When checked, after creating this clip, the form will reset but keep the video loaded for creating additional clips from the same source.
                  </p>
                  {createAnother && (
                    <div className="mt-2 flex items-center space-x-2 text-xs text-primary-600">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Video will remain loaded for reuse</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/workspace')}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {isLoading ? 'Creating...' : 'Create Clip'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChainSelector(true)}
                  disabled={isLoading || userChains.length === 0}
                  className="px-6 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {isLoading ? 'Creating...' : 'Create and Chain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Chain Selector Modal */}
      {showChainSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Select Chain</h3>
                <button 
                  onClick={() => setShowChainSelector(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Choose a chain to associate with your new clip
              </p>
            </div>
            
            <div className="px-6 py-4">
              {isLoadingChains ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading chains...</p>
                </div>
              ) : userChains.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No chains available</h3>
                  <p className="text-gray-500 mb-4">Create a chain first to associate clips with it</p>
                  <button
                    onClick={() => {
                      setShowChainSelector(false);
                      navigate('/create-chain');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200"
                  >
                    Create Chain
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-700 mb-3">
                    Select a chain to associate your clip with:
                  </div>
                  {userChains.map((chain) => (
                    <label key={chain._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="selectedChain"
                        value={chain._id}
                        checked={selectedChainId === chain._id}
                        onChange={(e) => setSelectedChainId(e.target.value)}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{chain.name}</div>
                        <div className="text-xs text-gray-500">
                          {chain.clips && chain.clips.length > 0 ? `${chain.clips.length} clips` : 'No clips yet'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {userChains.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowChainSelector(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAndChain}
                  disabled={!selectedChainId || isLoading}
                  className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? 'Creating...' : 'Create and Associate'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </LayoutWithSidebar>
  );
};

export default CreateClip;


