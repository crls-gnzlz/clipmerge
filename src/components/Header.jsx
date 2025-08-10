import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()
  const isLaunchpadPage = location.pathname.startsWith('/chain/')
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {isLaunchpadPage ? (
              <div className="flex flex-col items-start">
                <img src="/logo2.svg" alt="clipchain" className="h-8" />
                <span className="text-xs text-gray-600 mt-1">Turn video moments into powerful collections</span>
              </div>
            ) : (
              <Link to="/" className="flex flex-col items-start">
                <img src="/logo2.svg" alt="clipchain" className="h-8" />
                <span className="text-xs text-gray-600 mt-1">Turn video moments into powerful collections</span>
              </Link>
            )}
          </div>
          
          {!isLaunchpadPage && (
            <nav className="flex items-center space-x-8">
              <Link 
                to="/dashboard" 
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/dashboard' 
                    ? 'text-secondary-950' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
                <span className={`absolute bottom-0 left-0 h-0.5 bg-secondary-950 transition-all duration-200 ${
                  location.pathname === '/dashboard' ? 'w-full' : 'w-0'
                }`}></span>
              </Link>
   
              <Link 
                to="/library" 
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/library' 
                    ? 'text-secondary-950' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Library
                <span className={`absolute bottom-0 left-0 h-0.5 bg-secondary-950 transition-all duration-200 ${
                  location.pathname === '/library' ? 'w-full' : 'w-0'
                }`}></span>
              </Link>
              
              {/* User Profile Button */}
              <Link 
                to="/profile" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-950 hover:bg-secondary-900 text-white font-medium text-sm transition-colors duration-200"
                title="User Profile"
              >
                CG
              </Link>
            </nav>
          )}
          
          {/* Register for free button - only on launchpad pages */}
          {isLaunchpadPage && (
            <button className="bg-secondary-950 hover:bg-secondary-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
              Register for free
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
