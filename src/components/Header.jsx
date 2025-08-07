import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary-950 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">cM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">clipMerge</span>
                <span className="text-sm text-gray-600">Curate the content that really matters</span>
              </div>
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
