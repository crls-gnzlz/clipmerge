import React, { useEffect, useState } from 'react'

const CopyNotification = ({ isVisible, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(() => {
          onClose()
        }, 300)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
      isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-800">
              Link copied to clipboard!
            </p>
            <p className="text-xs text-secondary-600 mt-1 font-light">
              You can now share this clipchain with others
            </p>
          </div>
          <button
            onClick={() => {
              setIsAnimating(false)
              setTimeout(() => {
                onClose()
              }, 300)
            }}
            className="flex-shrink-0 text-secondary-400 hover:text-secondary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-opacity-50 rounded p-1"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CopyNotification
