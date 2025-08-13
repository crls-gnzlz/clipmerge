import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import apiService from '../lib/api.js';

const CreateClip = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    videoUrl: '',
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    tags: [],
    status: 'public'
  });
  
  const [videoDuration, setVideoDuration] = useState(null);
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [existingTags, setExistingTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Fetch existing tags for suggestions
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiService.getAllTags();
        if (response.success) {
          setExistingTags(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

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
      const response = await apiService.analyzeVideo(url);
      if (response.success && response.data) {
        const metadata = response.data;
        setVideoDuration(metadata.duration);
        setVideoMetadata(metadata);
        setFormData(prev => ({ 
          ...prev, 
          videoUrl: url,
          title: metadata.title || prev.title // Auto-fill title if available
        }));
        
        console.log('🎥 Video metadata received:', metadata);
      }
    } catch (error) {
      console.error('Error detecting video duration:', error);
      // Fallback: set a default duration for demo purposes
      setVideoDuration(300); // 5 minutes default
      setFormData(prev => ({ ...prev, videoUrl: url }));
      setVideoMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tag input
  const handleTagInput = (value) => {
    setTagInput(value);
    if (value.length > 0) {
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  // Add tag
  const addTag = (tag) => {
    if (formData.tags.length >= 3) return;
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.videoUrl) {
      newErrors.videoUrl = 'Video URL is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.startTime && formData.endTime) {
      const startSeconds = timeToSeconds(formData.startTime);
      const endSeconds = timeToSeconds(formData.endTime);
      
      if (startSeconds >= endSeconds) {
        newErrors.endTime = 'End time must be greater than start time';
      }
      
      if (videoDuration && endSeconds > videoDuration) {
        newErrors.endTime = `End time cannot exceed video duration (${secondsToTime(videoDuration)})`;
      }
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
      
      const clipData = {
        ...formData,
        startTime: timeToSeconds(formData.startTime),
        endTime: timeToSeconds(formData.endTime),
        duration: timeToSeconds(formData.endTime) - timeToSeconds(formData.startTime)
      };
      
      const response = await apiService.createClip(clipData);
      
      if (response.success) {
        navigate('/dashboard');
      } else {
        setErrors({ submit: response.message || 'Failed to create clip' });
      }
    } catch (error) {
      console.error('Error creating clip:', error);
      setErrors({ submit: 'An error occurred while creating the clip' });
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
  };

  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Clip
            </h1>
            <p className="text-gray-600">
              Extract a specific moment from a video to create a shareable clip
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video URL Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Video URL *
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      onBlur={(e) => detectVideoDuration(e.target.value)}
                      placeholder="https://youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        errors.videoUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => detectVideoDuration(formData.videoUrl)}
                      disabled={!formData.videoUrl || isLoading}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                  </div>
                  {errors.videoUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>
                  )}
                  {!errors.videoUrl && !videoDuration && (
                    <p className="text-gray-500 text-sm mt-1">
                      💡 Paste any YouTube URL (youtube.com, youtu.be, or embedded links)
                    </p>
                  )}
                  {videoDuration && (
                    <p className="text-green-600 text-sm mt-1">
                      Video duration: {secondsToTime(videoDuration)}
                    </p>
                  )}
                  
                  {/* Video Metadata Display */}
                  {isLoading && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <div className="text-blue-800 font-medium">Analyzing video...</div>
                      </div>
                    </div>
                  )}
                  
                  {videoMetadata && !isLoading && (
                    <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg overflow-hidden">
                      {/* Header */}
                      <div className="px-4 py-3 bg-primary-600 text-white">
                        <h3 className="text-sm font-semibold">
                          Video Information
                        </h3>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <div className="flex space-x-4">
                          {/* Thumbnail */}
                          <div className="flex-shrink-0">
                            <img 
                              src={videoMetadata.thumbnail} 
                              alt="Video thumbnail"
                              className="w-20 h-15 object-cover rounded-lg shadow-sm border border-gray-200"
                            />
                          </div>
                          
                          {/* Compact Metadata */}
                          <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div>
                                <span className="text-xs font-medium text-gray-500 block">Title</span>
                                <p className="text-gray-900 font-medium truncate">{videoMetadata.title}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-medium text-gray-500 block">Channel</span>
                                <p className="text-gray-700 truncate">{videoMetadata.channel}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-medium text-gray-500 block">Duration</span>
                                <p className="text-gray-700">{secondsToTime(videoMetadata.duration)}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-medium text-gray-500 block">Views</span>
                                <p className="text-gray-700">{videoMetadata.viewCount?.toLocaleString() || 'N/A'}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-medium text-gray-500 block">Category</span>
                                <p className="text-gray-700">{videoMetadata.category || 'N/A'}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-medium text-gray-500 block">Published</span>
                                <p className="text-gray-700">
                                  {videoMetadata.publishedAt ? new Date(videoMetadata.publishedAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Video ID - Small and subtle */}
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="text-xs text-gray-400">ID: {videoMetadata.id}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description - Collapsible */}
                        {videoMetadata.description && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <details className="group">
                              <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-primary-600 flex items-center">
                                Description
                                <span className="ml-auto transform group-open:rotate-180 transition-transform text-primary-500">▼</span>
                              </summary>
                              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                                {videoMetadata.description}
                              </p>
                            </details>
                          </div>
                        )}
                        
                        {/* Tags - Compact display */}
                        {videoMetadata.tags && videoMetadata.tags.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500">Tags</span>
                              <div className="flex flex-wrap gap-1">
                                {videoMetadata.tags.slice(0, 3).map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {videoMetadata.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{videoMetadata.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Selection Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    placeholder="MM:SS or HH:MM:SS"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Format: MM:SS or HH:MM:SS
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    placeholder="MM:SS or HH:MM:SS"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Must be greater than start time
                  </p>
                </div>
              </div>

              {/* Title Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a descriptive title for your clip"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Add a brief description of what this clip contains..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (Optional, Max 3)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagInput(e.target.value)}
                    placeholder="Type to search existing tags or add new ones"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                  
                  {/* Tag Suggestions */}
                  {showTagSuggestions && existingTags.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {existingTags
                        .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
                        .map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-gray-500 text-xs mt-1">
                  {formData.tags.length}/3 tags selected
                </p>
              </div>

              {/* Status Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Clip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
};

export default CreateClip;


