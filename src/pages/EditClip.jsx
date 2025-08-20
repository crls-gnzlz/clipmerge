import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import ChainSelector from '../components/ChainSelector.jsx';
import apiService from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ArrowPathIcon } from '@heroicons/react/24/solid'

const EditClip = () => {
  const { clipId } = useParams();
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
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const iframeRef = useRef(null);
  
  // New state for Save and Chain functionality
  const [showChainSelector, setShowChainSelector] = useState(false);

  // Load clip data on mount
  useEffect(() => {
    console.log('EditClip mounted with clipId:', clipId);
    
    const fetchClip = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getClipById(clipId);
        if (response.success) {
          const clip = response.data;
          setFormData({
            title: clip.title || '',
            description: clip.description || '',
            videoUrl: clip.videoUrl || '',
            startTime: secondsToTime(clip.startTime),
            endTime: secondsToTime(clip.endTime)
          });
          const vid = clip.videoId || extractVideoId(clip.videoUrl);
          setVideoId(vid);
          setVideoDuration(clip.duration || (clip.endTime - clip.startTime));
          // Analiza el vídeo automáticamente si hay videoUrl
          if (clip.videoUrl) {
            try {
              const analyzeRes = await apiService.analyzeVideo(clip.videoUrl);
              if (analyzeRes.success && analyzeRes.data) {
                setVideoMetadata(analyzeRes.data);
                setVideoDuration(analyzeRes.data.duration);
              }
            } catch (e) {
              // No bloquea la carga si falla el análisis
            }
          }
        } else {
          setErrors({ submit: response.message || 'Failed to load clip' });
        }
      } catch (error) {
        setErrors({ submit: error.message || 'Error loading clip' });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (clipId) {
      fetchClip();
    } else {
      console.error('clipId is undefined or null');
      setErrors({ submit: 'Clip ID is missing' });
      setIsLoading(false);
    }
  }, [clipId]);

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
    if (!seconds && seconds !== 0) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      return { isValid: true, message: '' };
    }
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);
    if (startSeconds >= endSeconds) {
      return { isValid: false, message: 'End time must be greater than start time' };
    }
    if (videoDuration && endSeconds > videoDuration) {
      return { isValid: false, message: `End time cannot exceed video duration (${secondsToTime(videoDuration)})` };
    }
    const clipDuration = endSeconds - startSeconds;
    if (clipDuration < 1) {
      return { isValid: false, message: 'Clip must be at least 1 second long' };
    }
    if (clipDuration > 600) {
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
    const startTimeValidation = validateTimeFormat(formData.startTime);
    if (!startTimeValidation.isValid) {
      newErrors.startTime = startTimeValidation.message;
    }
    const endTimeValidation = validateTimeFormat(formData.endTime);
    if (!endTimeValidation.isValid) {
      newErrors.endTime = endTimeValidation.message;
    }
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
      const response = await apiService.updateClip(clipId, clipData);
      if (response.success) {
        setSuccessMessage('Clip updated successfully!');
        setTimeout(() => navigate('/workspace'), 1200);
      } else {
        // Si hay errores de validación por campo
        if (response.errors && Array.isArray(response.errors)) {
          const fieldErrors = {};
          response.errors.forEach(err => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: response.message || 'Failed to update clip' });
        }
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred while updating the clip' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Save and Chain functionality
  const handleSaveAndChain = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setErrors({});
      
      // First, update the clip
      const clipData = {
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        startTime: timeToSeconds(formData.startTime),
        endTime: timeToSeconds(formData.endTime)
      };
      
      const updateResponse = await apiService.updateClip(clipId, clipData);
      if (!updateResponse.success) {
        if (updateResponse.errors && Array.isArray(updateResponse.errors)) {
          const fieldErrors = {};
          updateResponse.errors.forEach(err => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: updateResponse.message || 'Failed to update clip' });
        }
        return;
      }
      
      // If clip update successful, show chain selector
      setSuccessMessage('Clip updated successfully! Now select clips to add to your chain.');
      setShowChainSelector(true);
      
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred while updating the clip' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding selected clips to chain (this will be handled by ChainSelector)
  const handleAddClipsToChain = async (selectedChain) => {
    try {
      setIsLoading(true);
      
      console.log('Adding clip to chain:', {
        chainId: selectedChain._id,
        clipId: clipId,
        clipIdType: typeof clipId,
        clipIdLength: clipId ? clipId.length : 'undefined',
        chainName: selectedChain.name
      });
      
      // Validate clipId format (MongoDB ObjectId should be 24 characters)
      if (!clipId || typeof clipId !== 'string' || clipId.length !== 24) {
        throw new Error(`Invalid clipId: ${clipId}. Expected 24-character MongoDB ObjectId.`);
      }
      
      // Add the current clip to the selected chain
      const response = await apiService.addClipToChain(selectedChain._id, clipId);
      console.log('API response:', response);
      
      if (response.success) {
        setShowChainSelector(false);
        setSuccessMessage(`Clip successfully added to chain "${selectedChain.name}"! Redirecting to edit chain...`);
        
        // Redirect to Edit Chain page instead of workspace
        setTimeout(() => navigate(`/edit-chain/${selectedChain._id}`), 1500);
      } else {
        setErrors({ submit: response.message || 'Failed to add clip to chain' });
      }
    } catch (error) {
      console.error('Error adding clip to chain:', error);
      setErrors({ submit: error.message || 'An error occurred while adding clip to chain' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'startTime' || field === 'endTime') {
      const timeValidation = validateTimeFormat(value);
      if (!timeValidation.isValid && value) {
        setErrors(prev => ({ ...prev, [field]: timeValidation.message }));
      } else if (timeValidation.isValid) {
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
            setErrors(prev => ({ ...prev, endTime: '' }));
          }
        }
      }
    }
  };

  // Detect video duration from URL
  const detectVideoDuration = async (url) => {
    if (!url) return;
    try {
      setIsLoading(true);
      const extractedId = extractVideoId(url);
      if (extractedId) setVideoId(extractedId);
      const response = await apiService.analyzeVideo(url);
      if (response.success && response.data) {
        const metadata = response.data;
        setVideoDuration(metadata.duration);
        setVideoMetadata(metadata);
        setFormData(prev => ({ ...prev, videoUrl: url }));
      }
    } catch (error) {
      setVideoDuration(300);
      setFormData(prev => ({ ...prev, videoUrl: url }));
      setVideoMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  // YouTube player ready
  const onPlayerReady = (event) => {
    setYoutubePlayer(event.target);
  };

  // Copy current video time to specified field
  const copyCurrentTime = (field) => {
    if (!youtubePlayer) return;
    const currentTime = youtubePlayer.getCurrentTime();
    if (currentTime !== undefined && currentTime >= 0) {
      const timeString = secondsToTime(Math.floor(currentTime));
      handleInputChange(field, timeString);
    }
  };

  // Inicialización robusta del YouTube Player
  useEffect(() => {
    if (!videoId || !iframeRef.current) return;
    // Si la API de YouTube ya está cargada
    function createPlayer() {
      if (window.YT && window.YT.Player) {
        setYoutubePlayer(
          new window.YT.Player(iframeRef.current, {
            events: {
              onReady: onPlayerReady,
              onStateChange: () => {},
            },
          })
        );
      }
    }
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      // Espera a que la API esté lista
      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    }
    // Cleanup: destruye el player al desmontar/cambiar videoId
    return () => {
      if (youtubePlayer && typeof youtubePlayer.destroy === 'function') {
        youtubePlayer.destroy();
      }
      setYoutubePlayer(null);
    };
    // eslint-disable-next-line
  }, [videoId, iframeRef.current]);

  if (isLoading) {
    return (
      <LayoutWithSidebar>
        <div className="min-h-full bg-gray-50 relative">
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center justify-center">
              <ArrowPathIcon className="w-12 h-12 text-primary-600 animate-spin drop-shadow-lg mb-4" />
              <p className="text-xs text-gray-500 font-medium tracking-wide">Loading clip...</p>
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
          <div className="text-left mb-10">
            <h1 className="text-2xl font-light text-gray-900 mb-3">
              Edit Clip
            </h1>
            <p className="text-sm text-gray-500 font-light">
              Update a specific moment from a video
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
                      className="bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-medium border border-transparent hover:bg-primary-100 hover:text-primary-700 hover:border-primary-200 focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>
              </div>
              {/* Video Information Section - MOVER AQUÍ */}
              {videoMetadata && !isLoading && (
                <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                    <h3 className="text-xs font-medium text-gray-700">Video Information</h3>
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
                      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
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
                        className="bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-medium border border-transparent hover:bg-primary-100 hover:text-primary-700 hover:border-primary-200 focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-all duration-200 flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-medium border border-transparent hover:bg-primary-100 hover:text-primary-700 hover:border-primary-200 focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-all duration-200 flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="text-center p-3 bg-primary-50 border border-primary-100 rounded-lg min-h-[32px] flex items-center justify-center">
                {formData.startTime && formData.endTime && !errors.startTime && !errors.endTime
                  ? (
                    <p className="text-primary-600 text-xs font-medium">
                      Clip Duration: {secondsToTime(timeToSeconds(formData.endTime) - timeToSeconds(formData.startTime))}
                    </p>
                  )
                  : (
                    <p className="text-gray-400 text-xs font-medium">
                      Clip Duration: Calculating...
                    </p>
                  )
                }
              </div>
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
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndChain}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {isLoading ? 'Saving...' : 'Save & Chain'}
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
                Choose a chain to add your clip to
              </p>
            </div>
            
            <div className="px-6 py-4">
              <ChainSelector 
                onChainSelected={handleAddClipsToChain}
                onClose={() => setShowChainSelector(false)}
              />
            </div>
          </div>
        </div>
      )}
    </LayoutWithSidebar>
  );
};

export default EditClip;
