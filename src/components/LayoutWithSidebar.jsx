import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'

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
      <Header onToggleSidebar={toggleSidebar} />
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
        {children}
      </main>
    </div>
  )
}

export default LayoutWithSidebar
