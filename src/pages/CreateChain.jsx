import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import SelectField from '../components/SelectField.jsx';
import EnhancedClipSelector from '../components/ClipSelector.jsx';
import DragDropClips from '../components/DragDropClips.jsx';
import apiService from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const CreateChain = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [],
    status: 'public'
  });
  
  const [selectedClips, setSelectedClips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [existingTags, setExistingTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showClipSelector, setShowClipSelector] = useState(false);
  const [useMockData, setUseMockData] = useState(false); // Use real data by default when authenticated

  // Set mock data mode based on authentication status
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUseMockData(true);
      console.log('🎭 CreateChain: User not authenticated, using mock data');
    } else {
      setUseMockData(false);
      console.log('📡 CreateChain: User authenticated, using real data');
    }
  }, [isAuthenticated, user]);

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

  // Add tag
  const addTag = (tag) => {
    if (formData.tags.length >= 5) return;
    
    // Clean the tag (remove extra spaces, convert to lowercase)
    const cleanTag = tag.trim().toLowerCase();
    
    if (!formData.tags.includes(cleanTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, cleanTag]
      }));
      console.log('🏷️ CreateChain: Tag added:', cleanTag);
    } else {
      console.log('ℹ️ CreateChain: Tag already exists:', cleanTag);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  // Handle tag input with suggestions
  const handleTagInput = (value) => {
    setTagInput(value);
    if (value.length > 0) {
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  // Handle tag input submission (Enter key or Add button)
  const handleTagSubmit = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
    }
  };

  // Handle Enter key in tag input
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagSubmit();
    }
  };

  // Filter existing tags for suggestions
  const getTagSuggestions = () => {
    if (!tagInput.trim()) return [];
    
    const input = tagInput.toLowerCase();
    return existingTags.filter(tag => 
      tag.toLowerCase().includes(input) && 
      !formData.tags.includes(tag.toLowerCase())
    );
  };

  const tagSuggestions = getTagSuggestions();

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle adding clips to chain
  const handleAddClips = (clips) => {
    setSelectedClips(prev => [...prev, ...clips]);
    setShowClipSelector(false);
  };

  // Handle removing clip from chain
  const handleRemoveClip = (clipId) => {
    setSelectedClips(prev => prev.filter(clip => clip._id !== clipId));
  };

  // Handle reordering clips
  const handleReorderClips = (newOrder) => {
    setSelectedClips(newOrder);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Chain name is required';
    }
    
    // Remove the requirement for clips - allow empty chains
    // if (selectedClips.length === 0) {
    //   newErrors.clips = 'At least one clip is required';
    // }
    
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
      
      console.log('🚀 CreateChain: Starting chain creation...');
      console.log('📝 CreateChain: Form data:', formData);
      console.log('🎬 CreateChain: Selected clips:', selectedClips.length);
      
      if (useMockData) {
        // Simulate API call with mock data
        console.log('🎭 CreateChain: Using mock data mode');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ CreateChain: Mock chain created successfully');
        
        // Navigate to workspace after successful creation
        navigate('/workspace');
      } else {
        // Real API call
        console.log('📡 CreateChain: Using real API mode');
        
        const chainData = {
          name: formData.name, // Backend expects 'name' not 'title'
          description: formData.description,
          tags: formData.tags,
          isPublic: formData.status === 'public', // Convert status to boolean
          clips: selectedClips.length > 0 ? selectedClips.map((clip, index) => ({
            clip: clip._id, // Backend expects 'clip' not 'clipId'
            order: index
          })) : [] // Empty array for chains without clips
        };
        
        console.log('📤 CreateChain: Sending chain data to API:', chainData);
        console.log('🏷️ CreateChain: Tags being sent:', formData.tags);
        console.log('🎬 CreateChain: Clips count:', selectedClips.length);
        console.log('🔒 CreateChain: Public status:', chainData.isPublic);
        console.log('📋 CreateChain: Full form data:', formData);
        console.log('🎬 CreateChain: Selected clips details:', selectedClips);
        
        const response = await apiService.createChain(chainData);
        console.log('📥 CreateChain: API response received:', response);
        
        if (response.success) {
          console.log('✅ CreateChain: Chain created successfully, redirecting to workspace');
          
          // Show success message before redirecting
          if (formData.tags.some(tag => !existingTags.includes(tag))) {
            console.log('🏷️ CreateChain: New tags were created during chain creation');
          }
          
          navigate('/workspace');
        } else {
          console.log('❌ CreateChain: Failed to create chain:', response.message);
          setErrors({ submit: response.message || 'Failed to create chain' });
        }
      }
    } catch (error) {
      console.error('❌ CreateChain: Error occurred:', error);
      setErrors({ submit: error.message || 'An error occurred while creating the chain' });
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

  // Status options for SelectField
  const statusOptions = [
    { value: 'public', label: 'Public', description: 'Visible to everyone' },
    { value: 'private', label: 'Private', description: 'Only visible to you' }
  ];

  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl font-light text-gray-900 mb-2">
              Create New Chain
            </h1>
            <p className="text-sm text-gray-600">
              Create a collection of video clips that tell a story
            </p>
            
            {/* Mock Data Toggle */}
            <div className="mt-4 flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useMockData}
                  onChange={(e) => setUseMockData(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-opacity-50"
                />
                <span className="text-xs text-gray-600">Use mock data for testing</span>
              </label>
              
              {/* Data Mode Indicator */}
              <div className="flex items-center space-x-2">
                {useMockData ? (
                  <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                    🎭 Mock Mode
                  </span>
                ) : (
                  <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    📡 Real Data
                  </span>
                )}
                
                {isAuthenticated && user ? (
                  <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                    👤 {user.username}
                  </span>
                ) : (
                  <span className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                    🔒 Not Authenticated
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Chain Name Section */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Chain Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter a descriptive name for your chain"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-2 flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
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
                  placeholder="Add a brief description of what this chain contains..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                />
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Tags
                </label>
                {/* Tag Input */}
                <div className="relative">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => handleTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Type to search existing tags or add new ones"
                      className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={handleTagSubmit}
                      disabled={!tagInput.trim()}
                      className="px-4 py-2.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Tag Suggestions */}
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                        Existing tags:
                      </div>
                      {tagSuggestions.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* New Tag Indicator */}
                  {tagInput.trim() && !tagSuggestions.some(tag => tag.toLowerCase() === tagInput.toLowerCase()) && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                      💡 Press "Add" or Enter to create new tag: <strong>"{tagInput}"</strong>
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
                          className="ml-2 text-primary-600 hover:text-primary-800 transition-colors duration-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-gray-400 text-xs mt-2">
                  {formData.tags.length}/5 tags selected
                </p>
              </div>

              {/* Status Section */}
              <div>
                <SelectField
                  label="Status"
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                  placeholder="Select status"
                />
              </div>

              {/* Clips Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-medium text-gray-700">Clips</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Add clips to your chain or create an empty chain as a folder
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClipSelector(true)}
                    className="text-primary-600 hover:text-primary-700 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 rounded px-2 py-1"
                  >
                    + Add Clips
                  </button>
                </div>

                {/* Clip Selector Modal */}
                {showClipSelector && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Select Clips</h3>
                          <button 
                            onClick={() => setShowClipSelector(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded p-1"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                        <EnhancedClipSelector 
                          onAddClips={handleAddClips}
                          existingClipIds={selectedClips.map(clip => clip._id)}
                          useMockData={useMockData}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Clips or Empty State */}
                {selectedClips.length > 0 ? (
                  <DragDropClips
                    clips={selectedClips}
                    onOrderChange={handleReorderClips}
                    onRemoveClip={handleRemoveClip}
                  />
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No clips selected</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      This will create an empty chain that you can use as a folder to organize content later
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowClipSelector(true)}
                      className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      + Add Clips
                    </button>
                  </div>
                )}

                {/* Clips Error - No longer needed since clips are optional */}
                {/* {errors.clips && (
                  <p className="text-red-500 text-xs flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.clips}
                  </p>
                )} */}
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
                  onClick={() => navigate('/workspace')}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Chain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
};

export default CreateChain;
