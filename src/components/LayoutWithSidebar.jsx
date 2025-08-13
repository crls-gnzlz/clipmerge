import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar.jsx'

const LayoutWithSidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isDesktop, setIsDesktop] = useState(false)

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

  // Ensure sidebar is properly positioned on desktop
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
        {/* Mobile menu button - Only show on mobile when sidebar is closed */}
        {!isDesktop && !sidebarOpen && (
          <div className="lg:hidden p-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
