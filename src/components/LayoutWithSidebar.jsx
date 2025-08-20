import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const LayoutWithSidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isDesktop, setIsDesktop] = useState(false)
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024
      setIsDesktop(desktop)
      if (desktop) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isDesktop && !sidebarOpen) {
      setSidebarOpen(true)
    }
  }, [isDesktop])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleWidthChange = (newWidth) => {
    setSidebarWidth(newWidth)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        width={sidebarWidth}
        onWidthChange={handleWidthChange}
        isDesktop={isDesktop}
      />
      <main 
        className={`transition-all duration-300 ease-in-out`}
        style={{ 
          marginLeft: sidebarOpen && isDesktop ? `${sidebarWidth}px` : '0px' 
        }}
      >
        {/* Mobile menu button - Following Design System */}
        {!isDesktop && !sidebarOpen && (
          <div className="lg:hidden p-4">
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 border border-gray-200 hover:border-gray-300"
              aria-label="Open navigation menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}

export default LayoutWithSidebar
