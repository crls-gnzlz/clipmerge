import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import SelectField from '../components/SelectField.jsx';
import ClipSelector from '../components/ClipSelector.jsx';
import DragDropClips from '../components/DragDropClips.jsx';
import apiService from '../lib/api.js';

const CreateChain = () => {
  const navigate = useNavigate();
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
  const [useMockData, setUseMockData] = useState(true); // Enable mock data by default for testing

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
    if (formData.tags.length >= 5) return;
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
    
    if (selectedClips.length === 0) {
      newErrors.clips = 'At least one clip is required';
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
      
      if (useMockData) {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Creating chain with mock data:', {
          ...formData,
          clips: selectedClips.map((clip, index) => ({
            clipId: clip._id,
            order: index
          }))
        });
        
        // Navigate to dashboard after successful creation
        navigate('/dashboard');
      } else {
        // Real API call
        const chainData = {
          ...formData,
          clips: selectedClips.map((clip, index) => ({
            clipId: clip._id,
            order: index
          }))
        };
        
        const response = await apiService.createChain(chainData);
        
        if (response.success) {
          navigate('/dashboard');
        } else {
          setErrors({ submit: response.message || 'Failed to create chain' });
        }
      }
    } catch (error) {
      console.error('Error creating chain:', error);
      setErrors({ submit: 'An error occurred while creating the chain' });
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
              {useMockData && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Mock Mode Active
                </span>
              )}
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
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagInput(e.target.value)}
                    placeholder="Type to search existing tags or add new ones"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-200"
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
                  <h3 className="text-xs font-medium text-gray-700">Clips</h3>
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
                        <ClipSelector 
                          onAddClips={handleAddClips}
                          existingClipIds={selectedClips.map(clip => clip._id)}
                          useMockData={useMockData}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Clips */}
                <DragDropClips
                  clips={selectedClips}
                  onOrderChange={handleReorderClips}
                  onRemoveClip={handleRemoveClip}
                />

                {/* Clips Error */}
                {errors.clips && (
                  <p className="text-red-500 text-xs flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.clips}
                  </p>
                )}
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
