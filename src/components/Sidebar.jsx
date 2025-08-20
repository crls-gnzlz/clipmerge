import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppNotification from './AppNotification.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import apiService from '../lib/api.js'
import { createPortal } from 'react-dom'
import { HomeIcon, BriefcaseIcon, BookOpenIcon, FolderPlusIcon, PlayCircleIcon } from '@heroicons/react/24/solid'

const Sidebar = ({ isOpen, onToggle, width, onWidthChange, isDesktop }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  
  // Debug logs for authentication state
  useEffect(() => {
    console.log('🔍 Sidebar Debug - Auth State:', {
      isAuthenticated,
      authLoading,
      user: user ? {
        username: user.username,
        email: user.email,
        displayName: user.displayName
      } : null
    });
  }, [isAuthenticated, authLoading, user]);
  
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emails, setEmails] = useState([''])
  const [notification, setNotification] = useState({ isVisible: false, type: 'success', title: '', message: '' })
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [userClips, setUserClips] = useState([])
  const [userChains, setUserChains] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const sidebarRef = useRef(null)
  const resizeHandleRef = useRef(null)
  const profileMenuRef = useRef(null)
  const [profileMenuPos, setProfileMenuPos] = useState({ left: 0, top: 0, width: 0 })
  const [sidebarRect, setSidebarRect] = useState({ left: 0, top: 0 })

  // Handle loading state changes
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true)
    } else if (!isAuthenticated) {
      setIsLoading(false)
    }
  }, [authLoading, isAuthenticated])

  // Fetch user's clips and chains
  useEffect(() => {
    const fetchUserData = async () => {
      // Don't fetch data while auth is still loading
      if (authLoading) {
        return
      }
      
      if (isAuthenticated && user) {
        try {
          setIsLoading(true)
          const [clipsResponse, chainsResponse] = await Promise.all([
            apiService.getUserClips(),
            apiService.getUserChains()
          ])
          
          setUserClips(clipsResponse.data || [])
          setUserChains(chainsResponse.data || [])
        } catch (error) {
          console.error('Error fetching user data:', error)
        } finally {
          setIsLoading(false)
        }
      } else if (!isAuthenticated) {
        // Reset state when user is not authenticated
        setUserClips([])
        setUserChains([])
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [isAuthenticated, user, authLoading])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Loading state for clips and chains
  const renderClipsList = () => {
    if (authLoading || isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )
    }
    
    if (!isAuthenticated) {
      return (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400 font-light">Please log in to view your clips</p>
        </div>
      )
    }
    
    if (userClips.length === 0) {
      return (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400 font-light">No clips yet</p>
        </div>
      )
    }
    
    return userClips.slice(0, 5).map((clip) => (
      <div key={clip._id} className="group relative flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
        <div className="flex-1 min-w-0" onClick={(e) => { if (!e.target.closest('button')) navigate(`/edit-clip/${clip._id}`) }}>
          <div className="flex items-center">
            <PlayCircleIcon className="w-4 h-4 text-gray-900 mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-900 truncate font-medium">{clip.title}</p>
          </div>
        </div>
        <div className="relative">
          <button
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            aria-label="Clip options"
            onClick={e => {
              e.stopPropagation();
              openActionMenu('clip', clip._id, e.currentTarget)
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>
            </svg>
          </button>
          {actionMenu.type === 'clip' && actionMenu.id === clip._id && (
            <ActionMenu
              type="clip"
              id={clip._id}
              x={actionMenu.x}
              y={actionMenu.y}
              onEdit={() => { closeActionMenu(); navigate(`/edit-clip/${clip._id}`) }}
              onDelete={() => { closeActionMenu(); setDeleteTarget({ type: 'clip', id: clip._id }); setShowDeleteModal(true) }}
            />
          )}
        </div>
      </div>
    ))
  }

  const renderChainsList = () => {
    if (authLoading || isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )
    }
    
    if (!isAuthenticated) {
      return (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400 font-light">Please log in to view your chains</p>
        </div>
      )
    }
    
    if (userChains.length === 0) {
      return (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400 font-light">No chains yet</p>
        </div>
      )
    }
    
    return userChains.slice(0, 5).map((chain) => (
      <div key={chain._id} className="group relative flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
        <div className="flex-1 min-w-0" onClick={(e) => { if (!e.target.closest('button')) navigate(`/edit-chain/${chain._id}`) }}>
          <div className="flex items-center">
            <FolderPlusIcon className="w-4 h-4 text-gray-900 mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-900 truncate font-medium">{chain.name}</p>
          </div>
        </div>
        <div className="relative">
          <button
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            aria-label="Chain options"
            onClick={e => {
              e.stopPropagation();
              openActionMenu('chain', chain._id, e.currentTarget)
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>
            </svg>
          </button>
          {actionMenu.type === 'chain' && actionMenu.id === chain._id && (
            <ActionMenu
              type="chain"
              id={chain._id}
              x={actionMenu.x}
              y={actionMenu.y}
              onPreview={() => { closeActionMenu(); navigate(`/chain-preview/${chain._id}`) }}
              onEdit={() => { closeActionMenu(); navigate(`/edit-chain/${chain._id}`) }}
              onDelete={() => { closeActionMenu(); setDeleteTarget({ type: 'chain', id: chain._id }); setShowDeleteModal(true) }}
            />
          )}
        </div>
      </div>
    ))
  }

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
      setNotification({ isVisible: true, type: 'success', title: 'Copied!', message: 'Referral link copied to clipboard.' })
    } catch (err) {
      setNotification({ isVisible: true, type: 'error', title: 'Error', message: 'Failed to copy link.' })
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

  // Añade estados para el menú contextual y el elemento objetivo
  const [actionMenu, setActionMenu] = useState({ type: null, id: null, x: 0, y: 0 })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null })

  // Función para abrir el menú contextual
  const openActionMenu = (type, id, anchor) => {
    const rect = anchor.getBoundingClientRect()
    setActionMenu({ type, id, x: rect.right + 8, y: rect.bottom + window.scrollY + 4 }) // 120px ancho menú, 4px offset
  }
  const closeActionMenu = () => setActionMenu({ type: null, id: null, x: 0, y: 0 })

  // Función para borrar clip/chain
  const handleDelete = async () => {
    if (!deleteTarget.type || !deleteTarget.id) return
    try {
      if (deleteTarget.type === 'clip') {
        await apiService.deleteClip(deleteTarget.id)
        setUserClips(clips => clips.filter(c => c._id !== deleteTarget.id))
        setNotification({ isVisible: true, type: 'success', title: 'Deleted', message: 'Clip deleted successfully.' })
      } else if (deleteTarget.type === 'chain') {
        await apiService.deleteChain(deleteTarget.id)
        setUserChains(chains => chains.filter(c => c._id !== deleteTarget.id))
        setNotification({ isVisible: true, type: 'success', title: 'Deleted', message: 'Chain deleted successfully.' })
      }
    } catch (e) {
      setNotification({ isVisible: true, type: 'error', title: 'Error', message: 'Failed to delete.' })
    } finally {
      setShowDeleteModal(false)
      setDeleteTarget({ type: null, id: null })
    }
  }

  // Submenú contextual fuera del scroll, con iconos y estilo igual que Workspace
  function ActionMenu({ type, id, x, y, onEdit, onDelete, onPreview }) {
    return createPortal(
      <div style={{ position: 'absolute', left: x, top: y, zIndex: 9999 }} className="flex flex-col bg-white border border-gray-100 rounded-lg shadow-lg animate-fade-in divide-y divide-gray-100">
        {type === 'clip' && (
          <button
            className="flex-1 flex items-center justify-center px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-r-lg transition-colors"
            onClick={onDelete}
          >
            <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        )}
        {type === 'chain' && (
          <>
            <button
              className="flex-1 flex items-center justify-center px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 hover:text-blue-700 rounded-l-lg transition-colors"
              onClick={onPreview}
            >
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
            <button
              className="flex-1 flex items-center justify-center px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-r-lg transition-colors"
              onClick={onDelete}
            >
              <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </>
        )}
      </div>,
      document.body
    )
  }

  // Cierra el menú contextual al hacer click fuera
  useEffect(() => {
    document.addEventListener('mousedown', (e) => {
      if (actionMenu.type && !e.target.closest('.w-32.bg-white')) closeActionMenu()
    })
  }, [actionMenu.type])

  // Añade un estado para controlar el hover/focus del help icon y del popup
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpHover, setHelpHover] = useState(false)
  const [helpPopupHover, setHelpPopupHover] = useState(false)

  // Función para lanzar el onboarding
  const launchOnboarding = () => {
    localStorage.setItem('clipchain_onboarding_steps_v2', JSON.stringify([false, false, false]))
    window.location.reload()
  }

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
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-40 flex flex-col`}
        style={{ width: `${width}px` }}
      >
        {/* Header (User Profile) */}
        {isAuthenticated && (
          <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="mb-2">
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={e => {
                    setShowProfileMenu(!showProfileMenu)
                    if (!showProfileMenu && profileMenuRef.current) {
                      const rect = profileMenuRef.current.getBoundingClientRect()
                      setProfileMenuPos({
                        top: rect.top - (sidebarRef.current?.getBoundingClientRect().top || 0),
                        height: rect.height
                      })
                    }
                  }}
                  ref={profileMenuRef}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                  aria-label="User profile menu"
                  aria-expanded={showProfileMenu}
                  aria-haspopup="true"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center border-2 border-primary-200">
                    <span className="text-primary-700 text-sm font-semibold">
                      {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.displayName || user?.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate font-light">
                      {user?.email}
                    </p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 transform' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showProfileMenu ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
                  </svg>
                </button>
                {showProfileMenu && (
                  <div
                    className="bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                    style={{
                      position: 'absolute',
                      left: width - 2, // superpuesto 2px al sidebar
                      top: (() => {
                        const menuHeight = 180;
                        const btnHeight = profileMenuPos.height || 40;
                        let t = (profileMenuPos.top || 0) + btnHeight / 2 - menuHeight / 2;
                        if (typeof window !== 'undefined' && sidebarRef.current) {
                          const sidebarRect = sidebarRef.current.getBoundingClientRect();
                          if (t + menuHeight > window.innerHeight - sidebarRect.top) {
                            t = Math.max(8, window.innerHeight - sidebarRect.top - menuHeight - 8);
                          }
                          if (t < 8) t = 8;
                        }
                        return t;
                      })(),
                      minWidth: 220,
                      width: 240,
                    }}
                  >
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span>My Profile</span>
                      </Link>
                      <Link to="/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>Settings</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={async () => { await logout(); setShowProfileMenu(false); navigate('/login'); }} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:bg-red-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Navigation - sticky below header */}
        <nav className="space-y-2 mb-0 px-4 bg-white sticky top-[72px] z-10 border-b border-gray-100">
          <Link to="/" className={`flex items-center space-x-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-opacity-50 text-sm font-medium transition-all duration-200 ${isActive('/') ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'}`}> 
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Link to="/workspace" className={`flex items-center space-x-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-opacity-50 text-sm font-medium transition-all duration-200 ${isActive('/workspace') ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'}`}> 
            <BriefcaseIcon className="w-4 h-4" />
            <span>Workspace</span>
          </Link>
          <a href="/library" target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-opacity-50 text-sm font-medium transition-all duration-200 ${isActive('/library') ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'}`}> 
            <BookOpenIcon className="w-4 h-4" />
            <span>Library</span>
          </a>
        </nav>
        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 pt-6"> {/* pt-6 para igualar la separación entre bloques internos */}
            {/* Clips Section - Following Design System */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-medium text-gray-700">Clips</h4>
                <Link 
                  to="/create" 
                  className="text-primary-600 hover:text-primary-700 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 rounded px-1 py-0.5"
                >
                  + New
                </Link>
              </div>
              
              <div className={`overflow-y-auto space-y-1 pr-1 ${userClips.length === 0 ? 'h-8' : 'h-28'}`}>
                {renderClipsList()}
              </div>
            </div>

            {/* Subtle separator */}
            <div className="border-t border-gray-100 mb-6"></div>

            {/* Chains Section - Following Design System */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-medium text-gray-700">Chains</h4>
                <Link 
                  to="/create-chain" 
                  className="text-primary-600 hover:text-primary-700 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 rounded px-1 py-0.5"
                >
                  + New
                </Link>
              </div>
              
              <div className={`overflow-y-auto space-y-1 pr-1 ${userChains.length === 0 ? 'h-8' : 'h-28'}`}>
                {renderChainsList()}
              </div>
            </div>

            {/* Subtle separator */}
            <div className="border-t border-gray-100 mb-6"></div>

            {/* Invite Friends Section - Mejorado */}
            <div className="mb-6">
              <h4 className="text-xs font-medium text-gray-700 mb-1">Invite Friends</h4>
              <p className="text-xs text-gray-500 mb-3">Share your referral link or invite by email to grow your network.</p>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowEmailModal(true)}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-primary-700 hover:text-primary-800 text-xs font-medium py-2 px-3 rounded-lg border border-primary-100 hover:border-primary-200 transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-opacity-50 shadow-none"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Send Email</span>
                </button>
                <div className="py-2 px-3 bg-gray-50 rounded-lg border border-primary-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-primary-700 hover:text-primary-800 cursor-pointer overflow-hidden text-xs" onClick={copyReferralLink}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="underline truncate">clipchain.com/ref/carlos</span>
                    </div>
                    <button 
                      onClick={copyReferralLink}
                      className="ml-2 flex-shrink-0 text-primary-600 hover:text-primary-800 text-xs font-medium px-2 py-1 bg-white border border-primary-100 rounded-md hover:bg-gray-50 hover:border-primary-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-opacity-50"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer - sticky at bottom */}
        <div className="border-t border-gray-200 bg-white p-3 sticky bottom-0 z-10">
          <div className="flex items-center justify-between px-3">
            <img src="/logo-letters-blue.svg" alt="Clipchain" className="h-4 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200" onClick={handleLogoClick} />
            <div className="relative group">
              <div
                className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onMouseEnter={() => setHelpHover(true)}
                onMouseLeave={() => setTimeout(() => { if (!helpPopupHover) setHelpHover(false) }, 100)}
                onFocus={() => setHelpHover(true)}
                onBlur={() => setTimeout(() => { if (!helpPopupHover) setHelpHover(false) }, 100)}
                tabIndex={0}
                aria-label="Help & Documentation"
              >
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              {(helpHover || helpPopupHover) && (
                <div
                  className="absolute bottom-full right-0 mb-2 opacity-100 transition-all duration-300 pointer-events-auto z-50"
                  onMouseEnter={() => setHelpPopupHover(true)}
                  onMouseLeave={() => { setHelpPopupHover(false); setHelpHover(false) }}
                  onFocus={() => setHelpPopupHover(true)}
                  onBlur={() => { setHelpPopupHover(false); setHelpHover(false) }}
                  tabIndex={0}
                >
                  <div className="bg-white border border-blue-200 rounded-xl shadow-2xl p-4 w-56 animate-fade-in">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <h3 className="text-blue-800 font-semibold text-sm">Help & Documentation</h3>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed mb-1">Access tutorials, FAQ and support resources.</p>
                    <a href="/docs" className="inline-block mt-2 text-xs text-blue-600 hover:underline font-medium">Go to Documentation</a>
                    <button
                      onClick={launchOnboarding}
                      className="mt-4 w-full px-3 py-2 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 hover:text-primary-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      Launch onboarding
                    </button>
                    <div className="absolute top-full right-6 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-blue-200"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Resize Handle - Improved with reduced border */}
        <div
          ref={resizeHandleRef}
          data-resize-handle
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-primary-200 transition-colors duration-200 group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </div>
      </div>

      {/* Email Invitation Modal - Following Design System */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-200 max-w-sm w-full mx-4 border border-primary-200" style={{ boxShadow: '0 8px 32px 0 rgba(16, 112, 202, 0.12)' }}>
            <div className="px-6 py-5 border-b border-primary-100 flex items-center space-x-3 rounded-t-2xl relative">
              <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-primary-800">Invite Friends</h3>
              <button 
                onClick={() => setShowEmailModal(false)}
                aria-label="Close invite dialog"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-300 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 rounded p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-primary-700 mb-3">Enter email addresses to send invitations:</p>
              <div className="space-y-2">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 text-sm bg-white border border-primary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-100 focus:border-primary-400 hover:border-primary-300 transition-all duration-200 font-light text-primary-900 placeholder-primary-300"
                      aria-label={`Email address ${index+1}`}
                    />
                    {emails.length > 1 && (
                      <button
                        onClick={() => removeEmail(index)}
                        aria-label="Remove email"
                        className="text-red-300 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 rounded p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addEmail}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 rounded px-1 py-1 hover:bg-primary-50"
                  aria-label="Add another email"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add another</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-primary-100 flex justify-end space-x-2 rounded-b-2xl">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvites}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-200 shadow shadow-blue-100"
                aria-label="Send invites"
              >
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-xs w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-4">This action cannot be undone. Are you sure you want to delete this {deleteTarget.type}?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteTarget({ type: null, id: null }) }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AppNotification para feedback global */}
      <AppNotification
        isVisible={notification.isVisible}
        onClose={() => setNotification(n => ({ ...n, isVisible: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  )
}

export default Sidebar
