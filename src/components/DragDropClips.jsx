import React, { useState, useRef } from 'react';

const DragDropClips = ({ clips, onOrderChange, onRemoveClip }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);
  const dragItemRef = useRef(null);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    
    // Add visual feedback
    if (dragItemRef.current) {
      dragItemRef.current.style.opacity = '0.5';
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    setDraggedOverIndex(index);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) return;
    
    // Reorder clips
    const newClips = [...clips];
    const [draggedClip] = newClips.splice(draggedItem, 1);
    newClips.splice(dropIndex, 0, draggedClip);
    
    onOrderChange(newClips);
    setDraggedItem(null);
    setDraggedOverIndex(null);
    
    // Remove visual feedback
    if (dragItemRef.current) {
      dragItemRef.current.style.opacity = '1';
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverIndex(null);
    
    // Remove visual feedback
    if (dragItemRef.current) {
      dragItemRef.current.style.opacity = '1';
    }
  };

  if (clips.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">No clips added yet</h3>
        <p className="text-gray-500 text-xs">
          Add clips from your library to start building this chain
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-medium text-gray-700">Chain Order</h4>
        <p className="text-xs text-gray-500">{clips.length} clips</p>
      </div>
      
      <div className="space-y-2">
        {clips.map((clip, index) => (
          <React.Fragment key={clip._id}>
            {draggedOverIndex === index && draggedItem !== null && draggedItem !== index && (
              <div className="h-2 -my-2 flex items-center">
                <div className="w-full h-2 bg-blue-100 border-b-2 border-blue-400 rounded-full shadow-md animate-pulse"></div>
              </div>
            )}
            <div
              ref={index === draggedItem ? dragItemRef : null}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                relative group cursor-move bg-white border border-gray-200 rounded-lg px-3 py-2
                hover:border-gray-300 hover:shadow-sm transition-all duration-200
                ${draggedOverIndex === index ? 'border-blue-400 bg-blue-50' : ''}
                ${draggedItem === index ? 'opacity-50' : ''}
              `}
            >
              {/* Drag Handle */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex flex-col space-y-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              {/* Clip Content */}
              <div className="pl-6 flex items-center justify-between min-h-0">
                <div className="flex-1 min-w-0 flex items-center space-x-3">
                  <h5 className="text-sm font-medium text-gray-900 truncate">
                    {clip.title}
                  </h5>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {Math.floor((clip.duration || (clip.endTime - clip.startTime)) / 60)}:
                    {((clip.duration || (clip.endTime - clip.startTime)) % 60).toString().padStart(2, '0')}
                  </span>
                  {clip.tags && clip.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {clip.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                      {clip.tags.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{clip.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => onRemoveClip(clip._id)}
                  className="ml-3 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
                  title="Remove clip from chain"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-500 mt-3">
        Drag and drop clips to reorder them. The order will determine how clips play in sequence.
      </p>
    </div>
  );
};

export default DragDropClips;
