import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  // Check if current page should show auth buttons
  const shouldShowAuthButtons = () => {
    const publicPages = ['/landing', '/library']
    return publicPages.includes(location.pathname) || location.pathname.startsWith('/chain/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Tagline */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-start">
              <img src="/logo2.svg" alt="clipchain" className="h-6 w-auto" />
              <span className="text-xs text-gray-600 mt-1">Turn video moments into powerful collections</span>
            </Link>
          </div>

          {/* Desktop Navigation - Only show on public pages */}
          {shouldShowAuthButtons() && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-secondary-950 hover:bg-secondary-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
