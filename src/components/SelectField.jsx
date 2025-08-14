import React, { useState, useRef, useEffect } from 'react';

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  error = null,
  className = "",
  size = "default", // "small", "default", "large"
  variant = "default" // "default", "outlined", "filled"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            handleSelect(options[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options]);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setHighlightedIndex(-1);
    }
  };

  // Size classes
  const sizeClasses = {
    small: "px-3 py-2 text-xs",
    default: "px-4 py-2.5 text-sm",
    large: "px-5 py-3 text-base"
  };

  // Variant classes
  const variantClasses = {
    default: "bg-white border-gray-200 hover:border-gray-300 focus:border-primary-500",
    outlined: "bg-transparent border-gray-300 hover:border-gray-400 focus:border-primary-500",
    filled: "bg-gray-50 border-gray-200 hover:bg-gray-100 focus:bg-white focus:border-primary-500"
  };

  // Error state classes
  const errorClasses = error 
    ? "border-red-300 focus:border-red-500" 
    : "focus:ring-1 focus:ring-primary-500";

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleTriggerClick}
          disabled={disabled}
          className={`
            w-full text-left ${sizeClasses[size]} border rounded-lg transition-all duration-200
            ${variantClasses[variant]} ${errorClasses}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
            ${isOpen ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${label}-label` : undefined}
        >
          <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
            {displayValue}
          </span>
          
          {/* Dropdown Arrow */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 text-center">
              No options available
            </div>
          ) : (
            options.map((option, index) => (
              <div
                key={option.value}
                className={`
                  px-4 py-2 cursor-pointer text-sm transition-colors duration-150
                  ${index === highlightedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-900 hover:bg-gray-50'}
                  ${option.value === value ? 'bg-primary-100 text-primary-800 font-medium' : ''}
                `}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
                aria-selected={option.value === value}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{option.label}</span>
                  {option.value === value && (
                    <svg className="h-4 w-4 text-primary-600 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {option.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{option.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-xs mt-2 flex items-center">
          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;
