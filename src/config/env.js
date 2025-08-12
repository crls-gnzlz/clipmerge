// Frontend environment variables configuration
export const config = {
  // API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:9000/api',
  
  // Application
  appName: import.meta.env.VITE_APP_NAME || 'ClipChain',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Platform to create and share video clip sequences',
  
  // Features
  features: {
    authentication: true,
    userProfiles: true,
    clipCreation: true,
    chainCreation: true,
    searchAndFilter: true,
    pagination: true
  },
  
  // Limits
  limits: {
    maxClipDuration: 300, // 5 minutes in seconds
    maxClipsPerChain: 50,
    maxTagsPerClip: 10,
    maxDescriptionLength: 500,
    maxTitleLength: 100
  },
  
  // Default configuration
  defaults: {
    clipsPerPage: 12,
    chainsPerPage: 8,
    searchMinLength: 2,
    maxSearchResults: 100
  }
};

export default config;
