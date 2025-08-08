import React from 'react'
import { Link } from 'react-router-dom'

const LaunchpadHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex flex-col items-center">
            <img src="/logo.svg" alt="clipchain" className="h-6" />
            <span className="text-xs text-gray-600 mt-1">Turn video moments into powerful collections</span>
          </Link>
          
          {/* Register for free button */}
          <button className="bg-secondary-950 hover:bg-secondary-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
            Register for free
          </button>
        </div>
      </div>
    </header>
  )
}

export default LaunchpadHeader
