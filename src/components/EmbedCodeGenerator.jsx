import React, { useState } from 'react'
import PropTypes from 'prop-types'
import CopyNotification from './CopyNotification.jsx'

const EmbedCodeGenerator = ({ chainId, playerOptions = {} }) => {
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  
  // Default player options
  const defaultOptions = {
    width: '640',
    height: '360',
    autoplay: false,
    theme: 'default',
    ...playerOptions
  }

  // Generate the embed URL - use localhost in development, production URL otherwise
  const getEmbedUrl = () => {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname.includes('ngrok')
    
    if (isDevelopment) {
      // Use the current hostname and port for development/ngrok
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = window.location.port ? `:${window.location.port}` : ''
      return `${protocol}//${hostname}${port}/embed/${chainId}`
    } else {
      // Use production URL
      return `https://clipchain.app/embed/${chainId}`
    }
  }

  const embedUrl = getEmbedUrl()
  
  // Generate the HTML embed code
  const generateEmbedCode = () => {
    const { width, height, autoplay, theme } = defaultOptions
    
    let embedCode = `<iframe 
  src="${embedUrl}`
    
    if (autoplay) {
      embedCode += `?autoplay=1`
    }
    if (theme !== 'default') {
      embedCode += `${autoplay ? '&' : '?'}theme=${theme}`
    }
    
    embedCode += `"
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  allowfullscreen>
</iframe>`
    
    return embedCode
  }

  const embedCode = generateEmbedCode()

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setShowCopyNotification(true)
      setTimeout(() => setShowCopyNotification(false), 3000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = embedCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShowCopyNotification(true)
      setTimeout(() => setShowCopyNotification(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Embed Code</h3>
          <p className="text-sm text-gray-600">
            Copy this code to embed the Clipchain player on your website
          </p>
        </div>
      </div>

      {/* Embed Code Textarea */}
      <div className="space-y-3">
        <label htmlFor="embed-code" className="block text-sm font-medium text-gray-700">
          HTML Embed Code
        </label>
        <div className="relative">
          <textarea
            id="embed-code"
            value={embedCode}
            readOnly
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none focus:ring-2 focus:ring-secondary-950 focus:border-secondary-950"
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 flex items-center space-x-2 px-3 py-1.5 bg-secondary-950 text-white rounded-lg font-medium hover:bg-secondary-900 transition-all duration-200 hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold">Copy</span>
          </button>
        </div>
      </div>

      {/* Embed URL */}
      <div className="space-y-3">
        <label htmlFor="embed-url" className="block text-sm font-medium text-gray-700">
          Direct Embed URL
        </label>
        <div className="relative">
          <input
            id="embed-url"
            type="text"
            value={embedUrl}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-secondary-950 focus:border-secondary-950"
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(embedUrl)
              setShowCopyNotification(true)
              setTimeout(() => setShowCopyNotification(false), 3000)
            }}
            className="absolute top-2 right-2 flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold">Copy</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">How to use</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Copy the HTML code above and paste it into your website</li>
          <li>• The player will automatically load the Clipchain with ID: <code className="bg-blue-100 px-1 rounded">{chainId}</code></li>
          <li>• The player is responsive and will adapt to your website's design</li>
          <li>• Users can interact with all player controls (play, pause, navigate clips, etc.)</li>
        </ul>
      </div>

      {/* Copy Notification */}
      <CopyNotification
        isVisible={showCopyNotification}
        onClose={() => setShowCopyNotification(false)}
      />
    </div>
  )
}

EmbedCodeGenerator.propTypes = {
  chainId: PropTypes.string.isRequired,
  playerOptions: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string,
    autoplay: PropTypes.bool,
    theme: PropTypes.string,
  }),
}

export default EmbedCodeGenerator
