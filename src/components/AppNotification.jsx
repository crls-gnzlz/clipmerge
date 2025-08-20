import React, { useEffect, useState } from 'react';

const ICONS = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const COLORS = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    title: 'text-green-800',
    close: 'text-green-400 hover:text-green-600 focus:ring-green-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    title: 'text-red-800',
    close: 'text-red-400 hover:text-red-600 focus:ring-red-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    title: 'text-blue-800',
    close: 'text-blue-400 hover:text-blue-600 focus:ring-blue-500',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    title: 'text-yellow-800',
    close: 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500',
  },
};

const AppNotification = ({ isVisible, onClose, type = 'info', title, message, duration = 2500, action }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;
  const color = COLORS[type] || COLORS.info;
  const icon = ICONS[type] || ICONS.info;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`rounded-lg shadow-lg p-5 ${action ? 'max-w-md' : 'max-w-sm'} border flex items-start space-x-3 ${color.bg} ${color.border}`}> 
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1">
          {title && <p className={`text-sm font-semibold mb-1 ${color.title}`}>{title}</p>}
          <p className={`text-sm ${color.text}`}>{message}</p>
          {action && (
            <button
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`mt-3 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                type === 'success' 
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                  : type === 'error'
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                  : type === 'warning'
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(() => {
              onClose();
            }, 300);
          }}
          className={`flex-shrink-0 ml-2 ${color.close} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded p-1`}
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AppNotification;
