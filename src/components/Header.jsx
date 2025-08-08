import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-4">
              <img src="/logo.svg" alt="clipchain" className="h-6" />
              <span className="text-sm text-gray-600">Video moments, meaningful collections</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/collections" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Collections
            </Link>
            <Link to="/create" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Create Clip
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
