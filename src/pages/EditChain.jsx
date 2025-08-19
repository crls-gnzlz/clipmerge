import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx';
import SelectField from '../components/SelectField.jsx';
import EnhancedClipSelector from '../components/ClipSelector.jsx';
import DragDropClips from '../components/DragDropClips.jsx';
import apiService from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ArrowPathIcon } from '@heroicons/react/24/solid'

const EditChain = () => {
  const { chainId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [],
    status: 'public',
  });
  const [selectedClips, setSelectedClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [existingTags, setExistingTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showClipSelector, setShowClipSelector] = useState(false);

  // Fetch chain data on mount
  useEffect(() => {
    const fetchChain = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getChainById(chainId);
        if (response.success) {
          const chain = response.data;
          setFormData({
            name: chain.name || '',
            description: chain.description || '',
            tags: chain.tags || [],
            status: chain.isPublic ? 'public' : 'private',
          });
          // Adapt clips to the format expected by DragDropClips
          const chainClips = (chain.clips || []).map((clipItem, idx) => {
            // If populated, clipItem.clip is the object; else, fetch by ID
            if (clipItem.clip && typeof clipItem.clip === 'object') {
              return { ...clipItem.clip, order: clipItem.order ?? idx };
            } else if (typeof clipItem === 'object' && clipItem._id) {
              return { ...clipItem, order: clipItem.order ?? idx };
            }
            return null;
          }).filter(Boolean);
          setSelectedClips(chainClips);
        } else {
          setErrors({ submit: response.message || 'Failed to load chain' });
        }
      } catch (error) {
        setErrors({ submit: error.message || 'Error loading chain' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchChain();
  }, [chainId]);

  // Fetch existing tags for suggestions
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiService.getAllTags();
        if (response.success) {
          setExistingTags(response.data || []);
        }
      } catch (error) {
        // Ignore
      }
    };
    fetchTags();
  }, []);

  // Tag logic (same as CreateChain)
  const addTag = (tag) => {
    if (formData.tags.length >= 5) return;
    const cleanTag = tag.trim().toLowerCase();
    if (!formData.tags.includes(cleanTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, cleanTag] }));
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };
  const handleTagInput = (value) => {
    setTagInput(value);
    setShowTagSuggestions(!!value.length);
  };
  const handleTagSubmit = () => {
    if (tagInput.trim()) addTag(tagInput);
  };
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagSubmit();
    }
  };
  const getTagSuggestions = () => {
    if (!tagInput.trim()) return [];
    const input = tagInput.toLowerCase();
    return existingTags.filter(tag => tag.toLowerCase().includes(input) && !formData.tags.includes(tag.toLowerCase()));
  };
  const tagSuggestions = getTagSuggestions();
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  // Clips logic
  const handleAddClips = (clips) => {
    setSelectedClips(prev => [...prev, ...clips]);
    setShowClipSelector(false);
  };
  const handleRemoveClip = (clipId) => {
    setSelectedClips(prev => prev.filter(clip => clip._id !== clipId));
  };
  const handleReorderClips = (newOrder) => {
    setSelectedClips(newOrder);
  };

  // Form logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Chain name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      setErrors({});
      const chainData = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags,
        isPublic: formData.status === 'public',
        clips: selectedClips.length > 0 ? selectedClips.map((clip, index) => ({
          clip: clip._id,
          order: index
        })) : []
      };
      const response = await apiService.updateChain(chainId, chainData);
      if (response.success) {
        navigate('/workspace');
      } else {
        setErrors({ submit: response.message || 'Failed to update chain' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred while updating the chain' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const statusOptions = [
    { value: 'public', label: 'Public', description: 'Visible to everyone' },
    { value: 'private', label: 'Private', description: 'Only visible to you' }
  ];

  if (isLoading) {
    return (
      <LayoutWithSidebar>
        <div className="min-h-full bg-gray-50 relative">
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center justify-center">
              <ArrowPathIcon className="w-12 h-12 text-primary-600 animate-spin drop-shadow-lg mb-4" />
              <p className="text-xs text-gray-500 font-medium tracking-wide">Loading chain...</p>
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
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-gray-900 mb-2">Edit Chain</h1>
              <p className="text-sm text-gray-600">Update your collection of video clips</p>
            </div>
            <Link
              to={`/chain-preview/${chainId}`}
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              title="Preview chain"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-xs font-medium">Preview</span>
            </Link>
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
                      className="bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-medium border border-transparent hover:bg-primary-100 hover:text-primary-700 hover:border-primary-200 focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Press "Add" or Enter to create new tag: <strong>"{tagInput}"</strong>
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
                      Add, remove, or reorder clips in your chain
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
                          useMockData={false}
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
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
};

export default EditChain;
