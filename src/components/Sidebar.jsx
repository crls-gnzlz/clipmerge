import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CopyNotification from './CopyNotification.jsx'

const Sidebar = ({ isOpen, onToggle, width, onWidthChange, isDesktop }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emails, setEmails] = useState([''])
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const sidebarRef = useRef(null)
  const resizeHandleRef = useRef(null)

  // Mock data for recent clips and chains
  const recentClips = [
    { id: 1, title: 'Introduction to React', duration: '2:30', createdAt: '2024-01-15' },
    { id: 2, title: 'State Management', duration: '4:15', createdAt: '2024-01-14' },
    { id: 3, title: 'Hooks Tutorial', duration: '3:45', createdAt: '2024-01-13' },
    { id: 4, title: 'Component Lifecycle', duration: '5:20', createdAt: '2024-01-12' },
    { id: 5, title: 'Props vs State', duration: '2:55', createdAt: '2024-01-11' },
    { id: 6, title: 'Context API', duration: '3:10', createdAt: '2024-01-10' },
    { id: 7, title: 'Custom Hooks', duration: '4:05', createdAt: '2024-01-09' },
    { id: 8, title: 'Performance Optimization', duration: '6:15', createdAt: '2024-01-08' },
    { id: 9, title: 'Testing Components', duration: '4:30', createdAt: '2024-01-07' },
    { id: 10, title: 'Error Boundaries', duration: '3:20', createdAt: '2024-01-06' }
  ]

  const userChains = [
    { id: 1, name: 'React Fundamentals', clipsCount: 8, isPublic: true },
    { id: 2, name: 'Advanced JavaScript', clipsCount: 12, isPublic: false },
    { id: 3, name: 'CSS Grid Layout', clipsCount: 6, isPublic: true },
    { id: 4, name: 'TypeScript Basics', clipsCount: 10, isPublic: false },
    { id: 5, name: 'Node.js Backend', clipsCount: 15, isPublic: true },
    { id: 6, name: 'Database Design', clipsCount: 7, isPublic: false },
    { id: 7, name: 'API Development', clipsCount: 9, isPublic: true },
    { id: 8, name: 'Testing Strategies', clipsCount: 11, isPublic: false },
    { id: 9, name: 'Deployment Guide', clipsCount: 5, isPublic: true },
    { id: 10, name: 'Performance Tips', clipsCount: 13, isPublic: false },
    { id: 11, name: 'Security Best Practices', clipsCount: 8, isPublic: true },
    { id: 12, name: 'Mobile Development', clipsCount: 6, isPublic: false },
    { id: 13, name: 'Cloud Architecture', clipsCount: 9, isPublic: true },
    { id: 14, name: 'DevOps Practices', clipsCount: 7, isPublic: false },
    { id: 15, name: 'Microservices', clipsCount: 11, isPublic: true }
  ]

  const handleMouseDown = useCallback((e) => {
    console.log('Mouse down on resize handle')
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX
    const startWidth = width
    setIsDragging(true)
    setStartX(startX)
    setStartWidth(startWidth)
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX
      const newWidth = Math.max(280, Math.min(500, startWidth + deltaX))
      console.log('Resizing sidebar:', { deltaX, newWidth, startWidth })
      console.log('Calling onWidthChange with:', newWidth)
      onWidthChange(newWidth)
    }
    
    const handleMouseUp = () => {
      console.log('Mouse up - stopping resize')
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [width, onWidthChange])

  const isActive = (path) => location.pathname === path

  // Email invitation functions
  const addEmail = () => {
    setEmails([...emails, ''])
  }

  const updateEmail = (index, value) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const removeEmail = (index) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index)
      setEmails(newEmails)
    }
  }

  const handleSendInvites = () => {
    console.log('Sending invites to:', emails.filter(email => email.trim()))
    setShowEmailModal(false)
    setEmails([''])
  }

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText('https://clipchain.com/ref/carlos')
      setShowCopyNotification(true)
      setTimeout(() => setShowCopyNotification(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  // Prevent page scrolling when hovering over sidebar
  const preventScroll = (e) => {
    // Check if we're scrolling within a scrollable section
    const target = e.target
    const isScrollableSection = target.closest('.overflow-y-auto')
    const isScrollableContent = target.closest('.h-28')
    const isResizeHandle = target.closest('[data-resize-handle]')
    
    // Debug log
    console.log('Scroll event:', {
      target: target.tagName,
      isScrollableSection: !!isScrollableSection,
      isScrollableContent: !!isScrollableContent,
      isResizeHandle: !!isResizeHandle,
      className: target.className
    })
    
    // Don't prevent scroll if we're on the resize handle
    if (isResizeHandle) {
      console.log('On resize handle - allowing events')
      return
    }
    
    // Always prevent page scrolling when in sidebar, regardless of section
    // This ensures the page doesn't move when scrolling within sidebar sections
    console.log('Preventing page scroll - sidebar hover')
    e.preventDefault()
    e.stopPropagation()
    
    // If we're scrolling within a scrollable section, manually handle the scroll
    if (isScrollableSection || isScrollableContent) {
      console.log('Handling scroll within section manually')
      const scrollContainer = isScrollableSection || isScrollableContent
      const scrollAmount = e.deltaY
      
      // Apply the scroll to the container
      scrollContainer.scrollTop += scrollAmount
    }
  }

  // Add scroll prevention on sidebar hover
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (sidebar && isOpen) {
      sidebar.addEventListener('wheel', preventScroll, { passive: false })
      sidebar.addEventListener('touchmove', preventScroll, { passive: false })
      
      return () => {
        sidebar.removeEventListener('wheel', preventScroll)
        sidebar.removeEventListener('touchmove', preventScroll)
      }
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : (isDesktop ? 'translate-x-0' : '-translate-x-full')
        }`}
        style={{ width: `${width}px` }}
      >
        {/* Header with Profile - Reduced 20% and updated */}
        <div className="p-3 border-b border-gray-200 bg-white">
          <Link to="/profile" className="flex items-center space-x-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors cursor-pointer">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">C</span>
            </div>
            <div>
              <p className="text-xs text-gray-600">carlos@clipchain.com</p>
            </div>
          </Link>
        </div>

        {/* Content Area - Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            {/* Navigation - Reduced size */}
            <nav className="space-y-1 mb-4">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-primary-50 text-primary-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span className="text-xs font-medium">Home</span>
              </Link>
              
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive('/dashboard') 
                    ? 'bg-primary-50 text-primary-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-xs font-medium">Workspace</span>
              </Link>

              <Link
                to="/library"
                className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive('/library') 
                    ? 'bg-primary-50 text-primary-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-xs font-medium">Library</span>
              </Link>
            </nav>

            {/* Subtle separator */}
            <div className="border-t border-gray-100 mb-4"></div>

            {/* Clips Section - Allow 5 clips visible */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-900">Clips</h4>
                <Link 
                  to="/create" 
                  className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                >
                  + New
                </Link>
              </div>
              
              <div className="h-28 overflow-y-auto space-y-0.5 pr-1">
                {recentClips.map((clip) => (
                  <div key={clip.id} className="group relative flex items-center p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 truncate">{clip.title}</p>
                    </div>
                    {/* Hover menu with dots */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600 p-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle separator */}
            <div className="border-t border-gray-100 mb-4"></div>

            {/* Chains Section - Allow 5 chains visible */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-900">Chains</h4>
                <Link 
                  to="/create-chain" 
                  className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                >
                  + New
                </Link>
              </div>
              
              <div className="h-28 overflow-y-auto space-y-0.5 pr-1">
                {userChains.map((chain) => (
                  <div key={chain.id} className="group relative flex items-center p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 truncate">{chain.name}</p>
                    </div>
                    {/* Hover menu with dots */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600 p-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle separator */}
            <div className="border-t border-gray-100 mb-4"></div>

            {/* Invite Friends Section - Two separate buttons with blue accent */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-900 mb-2">Invite Friends</h4>
              <div className="space-y-2">
                {/* Email Invite Button */}
                <button 
                  onClick={() => setShowEmailModal(true)}
                  className="w-full bg-secondary-50 hover:bg-secondary-100 text-black hover:text-gray-900 text-xs font-medium py-1.5 px-2 rounded-md border border-secondary-200 hover:border-secondary-300 transition-all duration-200 flex items-center justify-center space-x-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Send Email</span>
                </button>
                
                {/* Copy Link Button with actual link display - Single line */}
                <div className="py-1.5 px-2 bg-secondary-50 rounded-md border border-secondary-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-secondary-950 hover:text-secondary-700 cursor-pointer overflow-hidden text-xs" onClick={copyReferralLink}>
                      <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="underline truncate">clipchain.com/ref/carlos</span>
                    </div>
                    <button 
                      onClick={copyReferralLink}
                      className="ml-2 flex-shrink-0 text-secondary-950 hover:text-secondary-700 text-xs font-medium px-1.5 py-0.5 bg-white border border-secondary-300 rounded hover:bg-secondary-50 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle separator */}
            <div className="border-t border-gray-100 mb-4"></div>

            {/* Settings Section - Minimalist like navigation */}
            <div className="mb-4">
              <Link
                to="/settings"
                className="flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-medium">Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer with Logo - Fixed at bottom */}
        <div className="border-t border-gray-200 bg-white p-2 absolute bottom-0 left-0 right-0">
          <div className="flex items-center justify-between px-3">
            {/* Logo */}
            <img 
              src="/logo2.svg" 
              alt="Clipchain" 
              className="h-4 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={handleLogoClick}
            />
            
            {/* Help Icon */}
            <div className="relative group">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                <span className="text-gray-600 text-xs font-medium" style={{ fontSize: '12px' }}>?</span>
              </div>
              
              {/* Help Hover Popup */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-gray-900 rounded-xl shadow-2xl p-4 w-48">
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-sm mb-1">
                      Help & Documentation
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      Access tutorials, FAQ and support resources
                    </p>
                  </div>
                  
                  {/* Arrow Pointer */}
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle - Improved with reduced border */}
        <div
          ref={resizeHandleRef}
          data-resize-handle
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-primary-200 transition-colors group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* Email Invitation Modal - Same as Workspace */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Invite Friends</h3>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter email addresses to send invitations:
              </p>
              
              <div className="space-y-3">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-secondary-950 focus:border-transparent"
                    />
                    {emails.length > 1 && (
                      <button
                        onClick={() => removeEmail(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={addEmail}
                  className="flex items-center space-x-2 text-secondary-950 hover:text-secondary-700 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add another email</span>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvites}
                className="bg-secondary-950 hover:bg-secondary-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Notification */}
      <CopyNotification 
        isVisible={showCopyNotification} 
        onClose={() => setShowCopyNotification(false)} 
      />
    </>
  )
}

export default Sidebar
