import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import CopyNotification from './CopyNotification.jsx'
import { Link } from 'react-router-dom'

const ClipchainPlayer = ({ title, description, clips, id, author, createdAt, tags, compact = false }) => {
  const playerId = `youtube-player-${id}`
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentClipIndex, setCurrentClipIndex] = useState(-1)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [visibleClipRange, setVisibleClipRange] = useState({ start: 0, end: 10 })
  const [isManualNavigation, setIsManualNavigation] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(100) // Volume state (0-100)
  const [isMuted, setIsMuted] = useState(false) // Mute state
  const [showVolumeSlider, setShowVolumeSlider] = useState(false) // Volume slider visibility
  
  const iframeRef = useRef(null)
  const fullscreenRef = useRef(null)
  const overlayRef = useRef(null)
  const fullscreenOverlayRef = useRef(null)
  const timerRef = useRef(null)
  const playerRef = useRef(null)
  
  const clipsPerPage = 6 // Show 6 clips per page
  const totalPages = Math.ceil(clips.length / clipsPerPage)
  const currentClips = clips.slice(currentPage * clipsPerPage, (currentPage + 1) * clipsPerPage)
  
  const currentClip = currentClipIndex >= 0 && currentClipIndex < clips.length ? clips[currentClipIndex] : null

  // Function to update visible clip range
  const updateVisibleClipRange = useCallback((clipIndex) => {
    const maxClipsPerView = 10
    
    setVisibleClipRange(prevRange => {
      let start = 0
      let end = maxClipsPerView

      if (clipIndex >= maxClipsPerView) {
        // If clip is beyond the first 10, adjust the range
        start = Math.floor(clipIndex / maxClipsPerView) * maxClipsPerView
        end = Math.min(start + maxClipsPerView, clips.length)
      } else if (clipIndex < prevRange.start) {
        // If clip is before the current range, go back to previous range
        start = Math.max(0, prevRange.start - maxClipsPerView)
        end = Math.min(start + maxClipsPerView, clips.length)
      } else if (clipIndex >= prevRange.end) {
        // If clip is beyond the current range, go to next range
        start = Math.floor(clipIndex / maxClipsPerView) * maxClipsPerView
        end = Math.min(start + maxClipsPerView, clips.length)
      } else {
        // If clip is within the current range, don't change anything
        return prevRange
      }

      return { start, end }
    })
  }, [clips.length])

  // Function to format time in MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle fullscreen toggle - move iframe between containers
  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen
    
    console.log('Toggle fullscreen:', { newFullscreenState, isPlaying, currentTime })
    
    // If exiting fullscreen, pause the video first
    if (isFullscreen && isPlaying) {
      console.log('Exiting fullscreen, pausing video')
      sendPostMessage('pauseVideo')
      setIsPlaying(false)
    }
    
    // Move iframe to appropriate container
    let iframe = iframeRef.current && iframeRef.current.firstChild
    
    // If not found in normal container, check fullscreen container
    if (!iframe && fullscreenRef.current) {
      const fullscreenContainer = fullscreenRef.current.querySelector('.fullscreen-video-container')
      iframe = fullscreenContainer && fullscreenContainer.firstChild
    }
    
    console.log('Found iframe:', !!iframe)
    
    if (iframe) {
      if (newFullscreenState) {
        // Move to fullscreen container
        const fullscreenContainer = fullscreenRef.current?.querySelector('.fullscreen-video-container')
        console.log('Found fullscreen container:', !!fullscreenContainer)
        
        if (fullscreenContainer) {
          // Clear the container first
          fullscreenContainer.innerHTML = ''
          // Move the iframe
          fullscreenContainer.appendChild(iframe)
          // Set iframe to fill the container
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.style.border = 'none'
          iframe.style.position = 'absolute'
          iframe.style.top = '0'
          iframe.style.left = '0'
          iframe.style.zIndex = '1'
          console.log('Moved iframe to fullscreen container')
        }
      } else {
        // Move back to normal container
        const normalContainer = iframeRef.current
        if (normalContainer) {
          // Clear the container first
          normalContainer.innerHTML = ''
          // Move the iframe back
          normalContainer.appendChild(iframe)
          // Reset iframe styles
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.style.border = 'none'
          iframe.style.position = 'relative'
          iframe.style.top = 'auto'
          iframe.style.left = 'auto'
          iframe.style.zIndex = 'auto'
          console.log('Moved iframe back to normal container')
        }
      }
    } else {
      console.error('No iframe found to move')
    }
    
    // Switch fullscreen state
    setIsFullscreen(newFullscreenState)
  }

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        // Pause video before exiting fullscreen
        if (isPlaying) {
          console.log('ESC pressed, pausing video before exiting fullscreen')
          sendPostMessage('pauseVideo')
          setIsPlaying(false)
        }
        setIsFullscreen(false)
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when in fullscreen
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen, isPlaying])

  // Create player on mount only
  useEffect(() => {
    createPlayer()
  }, [])

  const createPlayer = () => {
    console.log('createPlayer called for:', title, 'iframeRef:', !!iframeRef.current)
    
    // Create iframe for video player
    if (iframeRef.current) {
      // Clear the container first
      iframeRef.current.innerHTML = ''
      
      console.log('Creating iframe for:', title)
      
      // Create a simple iframe with YouTube embed URL
      const iframe = document.createElement('iframe')
      iframe.width = '100%'
      iframe.height = '100%'
      iframe.frameBorder = '0'
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      iframe.allowFullscreen = true
      
      // Set initial video (first clip) - disable controls, branding, and user info
      const initialVideoId = clips[0].videoId
      iframe.src = `https://www.youtube.com/embed/${initialVideoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=0&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&fs=0&start=${clips[0].startTime}&disablekb=1&playsinline=1&cc_load_policy=0&color=white&theme=dark&loop=0&playlist=${initialVideoId}`
      
      iframeRef.current.appendChild(iframe)
      
      // Store the iframe reference
      playerRef.current = {
        iframe: iframe,
        currentVideoId: initialVideoId
      }
      
      console.log('Iframe created successfully for:', title)
    }
  }

  // Helper function to send postMessage to YouTube iframe
  const sendPostMessage = (command, args = []) => {
    // Look for iframe in both containers
    let iframe = iframeRef.current && iframeRef.current.firstChild
    
    if (!iframe && fullscreenRef.current) {
      const fullscreenContainer = fullscreenRef.current.querySelector('.fullscreen-video-container')
      iframe = fullscreenContainer && fullscreenContainer.firstChild
    }
    
    if (iframe && iframe.contentWindow) {
      try {
        console.log('Sending command to iframe:', command, args)
        
        const message = {
          event: 'command',
          func: command,
          args: args
        }
        
        // Send immediately without delay for better responsiveness
        iframe.contentWindow.postMessage(JSON.stringify(message), '*')
      } catch (error) {
        console.error('Error sending postMessage:', error)
      }
    } else {
      console.error('No iframe available for command:', command)
    }
  }

  // Set player as ready when iframe is created
  useEffect(() => {
    const hasIframe = iframeRef.current && iframeRef.current.firstChild
    
    if (hasIframe) {
      setPlayerReady(true)
    }
  }, [])

  // Handle clip change
  useEffect(() => {
    console.log('Clip change effect triggered:', { currentClipIndex, playerReady, hasCurrentClip: !!currentClip })
    
    if (currentClipIndex >= 0 && currentClip) {
      // Clear any existing timers
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Reset current time to start of clip
      setCurrentTime(currentClip.startTime)
      setIsPlaying(false)
      
      // Try to load new video by changing iframe src
      try {
        console.log('Loading video:', currentClip.videoId, 'for clip:', currentClip.title)
        
        // Find the iframe in either container
        let iframe = null
        if (iframeRef.current && iframeRef.current.firstChild) {
          iframe = iframeRef.current.firstChild
        } else if (fullscreenRef.current) {
          const fullscreenContainer = fullscreenRef.current.querySelector('.fullscreen-video-container')
          iframe = fullscreenContainer && fullscreenContainer.firstChild
        }
        
        if (iframe) {
          // Update the iframe with the new video - disable controls, branding, and user info
          const newSrc = `https://www.youtube.com/embed/${currentClip.videoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=0&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&fs=0&start=${currentClip.startTime}&disablekb=1&playsinline=1&cc_load_policy=0&color=white&theme=dark&loop=0&playlist=${currentClip.videoId}`
          iframe.src = newSrc
          console.log('Updated iframe src to:', newSrc)
        }
        
        // Start playing the video after a short delay
        setTimeout(() => {
          if (currentClip) {
            // First seek to the start time
            sendPostMessage('seekTo', [currentClip.startTime, true])
            
            // Then start playing
            setTimeout(() => {
              sendPostMessage('playVideo')
              setIsPlaying(true)
            }, 300)
          }
        }, 1000)
      } catch (error) {
        console.error('Error loading video:', error)
      }
    }
  }, [currentClipIndex, currentClip])

  // Effect to handle time updates when playing
  useEffect(() => {
    if (isPlaying && currentClip) {
      const interval = setInterval(() => {
        setCurrentTime(prevTime => {
          const newTime = prevTime + 1
          if (newTime >= currentClip.endTime) {
            clearInterval(interval)
            return currentClip.endTime
          }
          return newTime
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isPlaying, currentClip])

  // Effect to handle clip changes and auto-advance
  useEffect(() => {
    if (isPlaying && currentClip && !isManualNavigation) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Set up timer to check if clip has ended
      timerRef.current = setInterval(() => {
        if (currentTime >= currentClip.endTime) {
          console.log('Clip ended, advancing to next')
          clearInterval(timerRef.current)
          
          // Auto-advance to next clip if available
          if (currentClipIndex < clips.length - 1) {
            setTimeout(() => {
              const nextIndex = currentClipIndex + 1
              setCurrentClipIndex(nextIndex)
              updateVisibleClipRange(nextIndex)
            }, 1000)
          } else {
            // If we're at the last clip, stop
            setIsPlaying(false)
          }
        }
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, currentClip?.endTime, currentClipIndex, clips, updateVisibleClipRange, isManualNavigation])

  // Listen for YouTube player state changes
  useEffect(() => {
    const handleMessage = (event) => {
      // Check if the message is from our iframe in either container
      const isFromNormalIframe = iframeRef.current && iframeRef.current.firstChild && event.source === iframeRef.current.firstChild.contentWindow
      const isFromFullscreenIframe = fullscreenRef.current && fullscreenRef.current.querySelector('.fullscreen-video-container')?.firstChild && event.source === fullscreenRef.current.querySelector('.fullscreen-video-container').firstChild.contentWindow
      
      if (isFromNormalIframe || isFromFullscreenIframe) {
        try {
          const data = JSON.parse(event.data)
          console.log('Received message from YouTube:', data, 'from:', isFromFullscreenIframe ? 'fullscreen' : 'normal')
          
          // Handle different message formats
          if (data.event === 'onStateChange') {
            // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (data.info === 2) { // Paused
              console.log('YouTube player paused')
              setIsPlaying(false)
            } else if (data.info === 1) { // Playing
              console.log('YouTube player playing')
              setIsPlaying(true)
            } else if (data.info === 0) { // Ended
              console.log('YouTube player ended')
              setIsPlaying(false)
              // Auto-advance to next clip if available
              if (currentClipIndex < clips.length - 1) {
                setTimeout(() => {
                  const nextIndex = currentClipIndex + 1
                  setCurrentClipIndex(nextIndex)
                  updateVisibleClipRange(nextIndex)
                }, 1000)
              }
            } else if (data.info === 3) { // Buffering
              console.log('YouTube player buffering')
            } else if (data.info === 5) { // Cued
              console.log('YouTube player cued')
            }
          } else if (data.event === 'command' && data.func === 'pauseVideo') {
            // Handle pause command response
            console.log('Pause command executed')
            setIsPlaying(false)
          } else if (data.event === 'command' && data.func === 'playVideo') {
            // Handle play command response
            console.log('Play command executed')
            setIsPlaying(true)
          } else if (data.event === 'command' && data.func === 'seekTo') {
            // Handle seek command response
            console.log('Seek command executed')
            // The time will be updated by our own time tracking
          }
        } catch (error) {
          // Ignore non-JSON messages
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Additional effect to handle iframe load and set up event listeners
  useEffect(() => {
    if (playerRef.current && playerRef.current.iframe) {
      const iframe = playerRef.current.iframe
      
      // Add event listener for iframe load
      const handleIframeLoad = () => {
        console.log('Iframe loaded, setting up player state detection')
        // Send a message to enable state change events
        const message = {
          event: 'listening',
          func: 'addEventListener',
          args: ['onStateChange']
        }
        setTimeout(() => {
          iframe.contentWindow.postMessage(JSON.stringify(message), '*')
        }, 1000)
      }

      iframe.addEventListener('load', handleIframeLoad)
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad)
      }
    }
  }, [playerRef.current])

  const togglePlay = () => {
    if (!currentClip) {
      // If no clip is selected, select the first clip
      console.log('No clip selected, selecting first clip')
      setCurrentClipIndex(0)
      return
    }
    
    // Toggle play/pause using YouTube's native controls
    if (isPlaying) {
      sendPostMessage('pauseVideo')
      setIsPlaying(false)
      console.log('Pausing video')
    } else {
      sendPostMessage('playVideo')
      setIsPlaying(true)
      console.log('Playing video')
    }
  }

  // Volume control functions
  const handleVolumeChange = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume))
    setVolume(clampedVolume)
    
    if (clampedVolume === 0) {
      setIsMuted(true)
      sendPostMessage('mute')
    } else {
      if (isMuted) {
        setIsMuted(false)
        sendPostMessage('unMute')
      }
      sendPostMessage('setVolume', [clampedVolume])
    }
    
    console.log('Volume changed to:', clampedVolume)
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      sendPostMessage('unMute')
      console.log('Unmuted')
    } else {
      setIsMuted(true)
      sendPostMessage('mute')
      console.log('Muted')
    }
  }

  const nextClip = useCallback(() => {
    if (!clips || !clips.length) return
    
    setIsManualNavigation(true)
    
    if (currentClipIndex >= clips.length - 1) {
      // If we're at the end, go to the beginning
      setCurrentClipIndex(0)
      updateVisibleClipRange(0)
    } else {
      const nextIndex = currentClipIndex + 1
      console.log('Setting next index to:', nextIndex)
      setCurrentClipIndex(nextIndex)
      updateVisibleClipRange(nextIndex)
    }
    
    // Reset the flag after a short delay
    setTimeout(() => setIsManualNavigation(false), 1000)
  }, [currentClipIndex, clips, updateVisibleClipRange])

  const previousClip = useCallback(() => {
    if (!clips || !clips.length) return
    
    setIsManualNavigation(true)
    
    if (currentClipIndex <= 0) {
      // If we're at the beginning, go to the end
      const lastIndex = clips.length - 1
      setCurrentClipIndex(lastIndex)
      updateVisibleClipRange(lastIndex)
    } else {
      const prevIndex = currentClipIndex - 1
      console.log('Setting previous index to:', prevIndex)
      setCurrentClipIndex(prevIndex)
      updateVisibleClipRange(prevIndex)
    }
    
    // Reset the flag after a short delay
    setTimeout(() => setIsManualNavigation(false), 1000)
  }, [currentClipIndex, clips, updateVisibleClipRange])

  const copyLink = () => {
    const shareUrl = `${window.location.origin}/chain/${id}`
    navigator.clipboard.writeText(shareUrl)
    setShowCopyNotification(true)
  }

  // Calculate progress percentage for the clip
  const getProgressPercentage = () => {
    if (!currentClip) return 0
    const totalDuration = currentClip.endTime - currentClip.startTime
    const currentProgress = currentTime - currentClip.startTime
    return Math.min((currentProgress / totalDuration) * 100, 100)
  }

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!currentClip) return 0
    const remaining = currentClip.endTime - currentTime
    return Math.max(0, remaining)
  }

  const getTotalClipTime = () => {
    if (!currentClip) return 0
    return currentClip.endTime - currentClip.startTime
  }

  // Handle timeline click and drag
  const handleTimelineClick = (e) => {
    const targetRef = isFullscreen ? fullscreenOverlayRef : overlayRef
    if (targetRef.current && currentClip) {
      const rect = targetRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = (clickX / width) * 100
      const newTime = currentClip.startTime + (percentage / 100) * (currentClip.endTime - currentClip.startTime)
      const clampedTime = Math.max(currentClip.startTime, Math.min(currentClip.endTime, newTime))
      
      // Update the current time immediately for UI responsiveness
      setCurrentTime(clampedTime)
      
      // Use postMessage to seek
      sendPostMessage('seekTo', [clampedTime, true])
      console.log('Seeking to time:', clampedTime, 'in', isFullscreen ? 'fullscreen' : 'normal', 'mode')
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    handleTimelineClick(e)
  }

  const handleMouseMove = (e) => {
    const targetRef = isFullscreen ? fullscreenOverlayRef : overlayRef
    if (isDragging && targetRef.current && currentClip) {
      const rect = targetRef.current.getBoundingClientRect()
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const width = rect.width
      const percentage = (clickX / width) * 100
      const newTime = currentClip.startTime + (percentage / 100) * (currentClip.endTime - currentClip.startTime)
      const clampedTime = Math.max(currentClip.startTime, Math.min(currentClip.endTime, newTime))
      
      // Update the current time immediately for UI responsiveness
      setCurrentTime(clampedTime)
      
      // Use postMessage to seek
      sendPostMessage('seekTo', [clampedTime, true])
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, currentClip])

  return (
    <>
      <div className={`bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:bg-gray-200 hover:border-gray-300 transition-all duration-300 group ${compact ? 'compact-player' : ''}`}>
        {/* Header with Logo and Copy Link */}
        <div className={`flex items-center justify-between border-b border-gray-300 hover:border-gray-400 transition-colors duration-300 ${compact ? 'p-2' : 'p-3'}`}>
          {/* Left side - Logo */}
          <div className="flex items-center">
            <img src="/logo-blue.svg" alt="clipchain" className={`brightness-110 filter group-hover:brightness-110 transition-all duration-300 ${compact ? 'h-4' : 'h-5'}`} />
          </div>
          
          {/* Right side - Copy Link */}
          <button
            onClick={copyLink}
            className={`flex items-center space-x-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-secondary-950 hover:text-white transition-all duration-200 hover:shadow-md ${compact ? 'px-2 py-1' : 'px-3 py-1.5'}`}
          >
            <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {!compact && <span className="text-sm font-semibold">Copy link</span>}
          </button>
        </div>

        {/* Title and Description */}
        <div className={`${compact ? 'px-2 pt-2 pb-1' : 'px-3 pt-4 pb-2'}`}>
          <h2 
            className={`font-bold text-gray-900 mb-1 cursor-help ${compact ? 'text-base' : 'text-xl'}`}
            title={tags && tags.length > 0 ? tags.join(', ') : ''}
          >
            {title}
          </h2>
          <div className={`flex flex-col justify-center ${compact ? 'min-h-[2rem]' : 'min-h-[3rem]'}`}>
            <p className={`text-gray-600 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
              {description}
            </p>
            {(author || createdAt) && (
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {author && (
                  <span className="hover:text-secondary-950 transition-colors">
                    By {author}
                  </span>
                )}
                {author && createdAt && <span>•</span>}
                {createdAt && <span>{new Date(createdAt).toLocaleDateString()}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className={`${compact ? 'px-2 pt-2 pb-2' : 'px-3 pt-3 pb-3'}`}>
            {/* Chapter Indicators at the top */}
            <div className="flex flex-col space-y-2">
              {/* Clip indicators */}
              <div className="flex space-x-2 flex-wrap">
                {clips && clips.length > 0 ? clips.slice(visibleClipRange.start, visibleClipRange.end).map((_, index) => {
                  const actualIndex = visibleClipRange.start + index
                  return (
                    <button
                      key={actualIndex}
                      onClick={() => {
                        console.log('Clicked clip:', actualIndex, 'player ready:', playerReady)
                        setIsManualNavigation(true)
                        setCurrentClipIndex(actualIndex)
                        updateVisibleClipRange(actualIndex)
                        setTimeout(() => setIsManualNavigation(false), 1000)
                      }}
                      className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                        actualIndex === currentClipIndex 
                          ? 'bg-secondary-950 text-white border-secondary-950' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-secondary-950 hover:text-secondary-950'
                      } ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}
                    >
                      {actualIndex + 1}
                    </button>
                  )
                }) : (
                  <span className="text-xs text-gray-500">No clips available</span>
                )}
              </div>
            </div>

            <div className="mb-2 mt-4">
              {currentClip ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {currentClip.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatTime(currentClip.startTime)} - {formatTime(currentClip.endTime)} ({formatTime(currentClip.endTime - currentClip.startTime)} duration)
                      </p>
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-secondary-950 hover:text-white transition-all duration-200 hover:shadow-md"
                      title="Toggle fullscreen"
                    >
                      {isFullscreen ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Select a clip to start playing</p>
                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-secondary-950 hover:text-white transition-all duration-200 hover:shadow-md"
                    title="Toggle fullscreen"
                  >
                    {isFullscreen ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className={`relative bg-black rounded-lg overflow-hidden mb-3 youtube-embed-clean ${isFullscreen ? 'hidden' : ''}`}>
              <div
                ref={iframeRef}
                className="w-full aspect-video"
                style={{ 
                  aspectRatio: '16/9',
                  minHeight: compact ? '200px' : '300px' // More compact height for library view
                }}
              />
              
              {/* Custom Play Button Overlay */}
              {(!currentClip || !isPlaying) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <button
                    onClick={togglePlay}
                    className="p-4 bg-secondary-950 bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                    title={currentClip ? 'Play' : 'Select a clip to play'}
                  >
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Transparent overlay to detect clicks when video is playing */}
              {isPlaying && currentClip && (
                <div 
                  className="absolute inset-0 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-all duration-200"
                  onClick={() => {
                    console.log('User clicked on video overlay - pausing video')
                    setIsPlaying(false)
                    sendPostMessage('pauseVideo')
                  }}
                  title="Click to pause"
                />
              )}
            </div>

            {/* Controls Section */}
            <div className={`space-y-2 ${compact ? 'space-y-1' : ''}`}>
              {/* Custom Timeline */}
              <div 
                ref={overlayRef}
                className={`relative w-full bg-gray-300 rounded-full cursor-pointer ${compact ? 'h-1' : 'h-1.5'}`}
                onClick={handleTimelineClick}
                onMouseDown={handleMouseDown}
              >
                {/* Progress track */}
                <div 
                  className="absolute left-0 top-0 h-full bg-secondary-950 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
                
                {/* Progress handle */}
                <div 
                  className={`absolute top-1/2 bg-secondary-950 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1.5 cursor-pointer hover:scale-110 transition-transform border-2 border-white ${compact ? 'w-2 h-2' : 'w-3 h-3'}`}
                  style={{ left: `${getProgressPercentage()}%` }}
                ></div>
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                {/* Playback Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={previousClip}
                    className={`text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200 ${compact ? 'p-1' : 'p-1.5'}`}
                    title="Previous clip"
                  >
                    <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className={`text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200 ${compact ? 'p-1.5' : 'p-2'}`}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={nextClip}
                    className={`text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200 ${compact ? 'p-1' : 'p-1.5'}`}
                    title="Next clip"
                  >
                    <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                    </svg>
                  </button>
                </div>

                {/* Volume Controls */}
                <div 
                  className="flex items-center space-x-2 relative"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  {/* Mute/Unmute button */}
                  <button
                    onClick={toggleMute}
                    className={`text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200 ${compact ? 'p-1' : 'p-1.5'}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    ) : volume < 50 ? (
                      <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                      </svg>
                    ) : (
                      <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    )}
                  </button>
                  
                  {/* Volume slider - inline with the button */}
                  <div 
                    className={`flex items-center space-x-2 transition-all duration-300 ease-in-out ${
                      showVolumeSlider 
                        ? 'opacity-100 max-w-32' 
                        : 'opacity-0 max-w-0 overflow-hidden'
                    }`}
                  >
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                      className={`bg-gray-300 rounded-full appearance-none cursor-pointer slider ${compact ? 'w-12 h-1' : 'w-16 h-1.5'}`}
                      style={{
                        background: `linear-gradient(to right, #0F4C81 0%, #0F4C81 ${isMuted ? 0 : volume}%, #e5e7eb ${isMuted ? 0 : volume}%, #e5e7eb 100%)`
                      }}
                      title={`Volume: ${isMuted ? 0 : volume}%`}
                    />
                    {!compact && (
                      <span className="text-xs text-gray-600 w-8">
                        {isMuted ? 0 : volume}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Time info - only show remaining time */}
                <div className="flex-1 text-right">
                  <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-xs'}`}>
                    {currentClip ? formatTime(getRemainingTime()) : '00:00'}
                  </span>
                </div>
              </div>
            </div>
        </div>
        <CopyNotification
          isVisible={showCopyNotification}
          onClose={() => setShowCopyNotification(false)}
        />
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div 
          ref={fullscreenRef}
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <img src="/logo-blue.svg" alt="clipchain" className="h-6 brightness-110 filter" />
              <div>
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-sm text-gray-300">{description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyLink}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm font-semibold">Copy link</span>
              </button>
              <button
                onClick={toggleFullscreen}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
                title="Exit fullscreen (ESC)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-semibold">Exit</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Video Section - Large and centered */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 lg:p-6 bg-black min-h-0">
              <div className="w-full max-w-6xl h-full flex flex-col">
                {/* Clip indicators for fullscreen */}
                <div className="flex justify-center mb-3 lg:mb-4 flex-shrink-0">
                  <div className="flex space-x-2 flex-wrap justify-center">
                    {clips && clips.length > 0 ? clips.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsManualNavigation(true)
                          setCurrentClipIndex(index)
                          updateVisibleClipRange(index)
                          setTimeout(() => setIsManualNavigation(false), 1000)
                        }}
                        className={`px-3 py-1 text-sm font-medium rounded border transition-colors ${
                          index === currentClipIndex 
                            ? 'bg-secondary-950 text-white border-secondary-950' 
                            : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-secondary-950 hover:text-secondary-950'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )) : (
                      <span className="text-sm text-gray-500">No clips available</span>
                    )}
                  </div>
                </div>

                {/* Current clip info */}
                {currentClip && (
                  <div className="text-center mb-3 lg:mb-4 flex-shrink-0">
                    <h3 className="text-lg lg:text-xl font-semibold text-white mb-1">
                      {currentClip.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatTime(currentClip.startTime)} - {formatTime(currentClip.endTime)} ({formatTime(currentClip.endTime - currentClip.startTime)} duration)
                    </p>
                  </div>
                )}

                {/* Large video player */}
                <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl flex-1 min-h-0 fullscreen-video-container youtube-embed-clean" style={{ minHeight: '400px' }}>
                  {/* The iframe will be moved here when in fullscreen mode */}
                  
                  {/* Custom Play Button Overlay */}
                  {(!currentClip || !isPlaying) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                      <button
                        onClick={togglePlay}
                        className="p-6 bg-secondary-950 bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                        title={currentClip ? 'Play' : 'Select a clip to play'}
                      >
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Transparent overlay to detect clicks when video is playing */}
                  {isPlaying && currentClip && (
                    <div 
                      className="absolute inset-0 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-all duration-200 z-10"
                      onClick={() => {
                        setIsPlaying(false)
                        sendPostMessage('pauseVideo')
                      }}
                      title="Click to pause"
                    />
                  )}
                </div>

                {/* Fullscreen Controls */}
                <div className="mt-4 lg:mt-6 space-y-3 lg:space-y-4 flex-shrink-0">
                  {/* Timeline */}
                  <div 
                    ref={fullscreenOverlayRef}
                    className="relative w-full h-2 bg-gray-700 rounded-full cursor-pointer"
                    onClick={handleTimelineClick}
                    onMouseDown={handleMouseDown}
                  >
                    <div 
                      className="absolute left-0 top-0 h-full bg-secondary-950 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                    <div 
                      className="absolute top-1/2 w-4 h-4 bg-secondary-950 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-2 cursor-pointer hover:scale-110 transition-transform border-2 border-white"
                      style={{ left: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>

                  {/* Clip navigation controls */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <button
                        onClick={previousClip}
                        className="p-2 text-white hover:text-secondary-950 hover:bg-gray-700 rounded-full transition-all duration-200"
                        title="Previous clip"
                      >
                        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={togglePlay}
                        className="p-2 lg:p-3 text-white hover:text-secondary-950 hover:bg-gray-700 rounded-full transition-all duration-200"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={nextClip}
                        className="p-2 text-white hover:text-secondary-950 hover:bg-gray-700 rounded-full transition-all duration-200"
                        title="Next clip"
                      >
                        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Volume Controls */}
                    <div 
                      className="flex items-center space-x-2 relative"
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                      {/* Mute/Unmute button */}
                      <button
                        onClick={toggleMute}
                        className="p-2 text-white hover:text-secondary-950 hover:bg-gray-700 rounded-full transition-all duration-200"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                          </svg>
                        ) : volume < 50 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        )}
                      </button>
                      
                      {/* Volume slider - inline with the button */}
                      <div 
                        className={`flex items-center space-x-2 transition-all duration-300 ease-in-out ${
                          showVolumeSlider 
                            ? 'opacity-100 max-w-40' 
                            : 'opacity-0 max-w-0 overflow-hidden'
                        }`}
                      >
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                          className="w-20 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #0F4C81 0%, #0F4C81 ${isMuted ? 0 : volume}%, #4b5563 ${isMuted ? 0 : volume}%, #4b5563 100%)`
                          }}
                          title={`Volume: ${isMuted ? 0 : volume}%`}
                        />
                        <span className="text-sm text-white w-8">
                          {isMuted ? 0 : volume}%
                        </span>
                      </div>
                    </div>

                    {/* Time info - only show remaining time */}
                    <div className="flex-1 text-right">
                      <span className="text-sm text-white">
                        {currentClip ? formatTime(getRemainingTime()) : '00:00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar with clips list */}
            <div className="w-full lg:w-80 bg-gray-900 p-4 overflow-y-auto flex-shrink-0">
              <h3 className="text-lg font-semibold text-white mb-4">Clips</h3>
              <div className="space-y-2">
                {clips && clips.length > 0 ? clips.map((clip, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsManualNavigation(true)
                      setCurrentClipIndex(index)
                      updateVisibleClipRange(index)
                      setTimeout(() => setIsManualNavigation(false), 1000)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      index === currentClipIndex 
                        ? 'bg-secondary-950 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{clip.title}</div>
                    <div className="text-sm opacity-75">
                      {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                    </div>
                  </button>
                )) : (
                  <p className="text-gray-500">No clips available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

ClipchainPlayer.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  clips: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    videoId: PropTypes.string.isRequired,
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired,
  })).isRequired,
  author: PropTypes.string,
  createdAt: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
}

export default ClipchainPlayer