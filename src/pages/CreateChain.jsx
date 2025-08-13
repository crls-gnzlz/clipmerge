import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import apiService from '../lib/api.js';

const CreateChain = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [],
    status: 'public'
  });
  
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Chain name is required';
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
      
      const response = await apiService.createChain(formData);
      
      if (response.success) {
        navigate('/dashboard');
      } else {
        setErrors({ submit: response.message || 'Failed to create chain' });
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

  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Chain
            </h1>
            <p className="text-gray-600">
              Create a collection of video clips that tell a story
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Chain Name Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chain Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter a descriptive name for your chain"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
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
                  placeholder="Add a brief description of what this chain contains..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (Optional, Max 5)
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
                  {formData.tags.length}/5 tags selected
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
