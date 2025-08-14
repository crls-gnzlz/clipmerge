export const mockChains = [
  {
    _id: 'chain_001',
    name: 'React Development Fundamentals',
    description: 'Complete guide to React development from basics to advanced patterns',
    status: 'public',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    clips: [
      { clipId: 'clip_001', order: 0 },
      { clipId: 'clip_002', order: 1 },
      { clipId: 'clip_003', order: 2 }
    ],
    tags: ['react', 'frontend', 'development', 'tutorial']
  },
  {
    _id: 'chain_002',
    name: 'Backend Performance Optimization',
    description: 'Learn how to optimize Node.js and MongoDB applications for better performance',
    status: 'private',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
    clips: [
      { clipId: 'clip_004', order: 0 },
      { clipId: 'clip_005', order: 1 }
    ],
    tags: ['nodejs', 'mongodb', 'performance', 'backend']
  },
  {
    _id: 'chain_003',
    name: 'DevOps Best Practices',
    description: 'Essential DevOps practices including Docker, Git workflows, and deployment strategies',
    status: 'public',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    clips: [
      { clipId: 'clip_006', order: 0 },
      { clipId: 'clip_007', order: 1 }
    ],
    tags: ['devops', 'docker', 'git', 'deployment']
  },
  {
    _id: 'chain_004',
    name: 'API Design & Testing',
    description: 'Comprehensive guide to designing RESTful APIs and testing them effectively',
    status: 'public',
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    clips: [
      { clipId: 'clip_008', order: 0 },
      { clipId: 'clip_009', order: 1 }
    ],
    tags: ['api', 'rest', 'testing', 'design']
  },
  {
    _id: 'chain_005',
    name: 'State Management Patterns',
    description: 'Advanced state management techniques with Redux Toolkit and modern React',
    status: 'private',
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T11:30:00Z',
    clips: [
      { clipId: 'clip_010', order: 0 }
    ],
    tags: ['redux', 'state-management', 'react', 'patterns']
  }
];

export const mockClipsForWorkspace = [
  {
    _id: 'clip_001',
    title: 'Introduction to React Hooks',
    description: 'Learn the basics of React Hooks including useState, useEffect, and custom hooks',
    duration: 180,
    startTime: 0,
    endTime: 180,
    tags: ['react', 'hooks', 'tutorial'],
    createdAt: '2024-01-15T10:30:00Z',
    status: 'public'
  },
  {
    _id: 'clip_002',
    title: 'Advanced TypeScript Patterns',
    description: 'Explore advanced TypeScript patterns like generics, utility types, and conditional types',
    duration: 240,
    startTime: 0,
    endTime: 240,
    tags: ['typescript', 'advanced', 'patterns'],
    createdAt: '2024-01-14T14:20:00Z',
    status: 'public'
  },
  {
    _id: 'clip_003',
    title: 'CSS Grid Layout Mastery',
    description: 'Master CSS Grid Layout with practical examples and responsive design techniques',
    duration: 300,
    startTime: 0,
    endTime: 300,
    tags: ['css', 'grid', 'layout'],
    createdAt: '2024-01-13T09:15:00Z',
    status: 'public'
  },
  {
    _id: 'clip_004',
    title: 'Node.js Performance Optimization',
    description: 'Learn how to optimize Node.js applications for better performance and scalability',
    duration: 360,
    startTime: 0,
    endTime: 360,
    tags: ['nodejs', 'performance', 'optimization'],
    createdAt: '2024-01-12T16:45:00Z',
    status: 'public'
  },
  {
    _id: 'clip_005',
    title: 'MongoDB Aggregation Pipeline',
    description: 'Deep dive into MongoDB aggregation pipeline for complex data queries',
    duration: 420,
    startTime: 0,
    endTime: 420,
    tags: ['mongodb', 'aggregation', 'database'],
    createdAt: '2024-01-11T11:30:00Z',
    status: 'public'
  },
  {
    _id: 'clip_006',
    title: 'Docker Containerization Best Practices',
    description: 'Learn Docker best practices for containerization and deployment',
    duration: 300,
    startTime: 0,
    endTime: 300,
    tags: ['docker', 'containers', 'devops'],
    createdAt: '2024-01-10T13:20:00Z',
    status: 'public'
  },
  {
    _id: 'clip_007',
    title: 'Git Workflow Strategies',
    description: 'Explore different Git workflow strategies for team collaboration',
    duration: 240,
    startTime: 0,
    endTime: 240,
    tags: ['git', 'workflow', 'collaboration'],
    createdAt: '2024-01-09T15:10:00Z',
    status: 'public'
  },
  {
    _id: 'clip_008',
    title: 'API Design Principles',
    description: 'Learn RESTful API design principles and authentication methods',
    duration: 360,
    startTime: 0,
    endTime: 360,
    tags: ['api', 'rest', 'design'],
    createdAt: '2024-01-08T10:00:00Z',
    status: 'public'
  },
  {
    _id: 'clip_009',
    title: 'Testing with Jest and React Testing Library',
    description: 'Comprehensive guide to testing React applications with modern tools',
    duration: 480,
    startTime: 0,
    endTime: 480,
    tags: ['testing', 'jest', 'react-testing-library'],
    createdAt: '2024-01-07T14:30:00Z',
    status: 'public'
  },
  {
    _id: 'clip_010',
    title: 'State Management with Redux Toolkit',
    description: 'Modern Redux development with Redux Toolkit for simplified state management',
    duration: 540,
    startTime: 0,
    endTime: 540,
    tags: ['redux', 'state-management', 'react'],
    createdAt: '2024-01-06T12:15:00Z',
    status: 'public'
  }
];

// Helper function to get chains with clip details
export const getChainsWithClips = () => {
  return mockChains.map(chain => {
    const chainClips = chain.clips.map(clipRef => {
      const clip = mockClipsForWorkspace.find(c => c._id === clipRef.clipId);
      return clip ? { ...clip, order: clipRef.order } : null;
    }).filter(Boolean).sort((a, b) => a.order - b.order);
    
    return {
      ...chain,
      clips: chainClips,
      clipCount: chainClips.length
    };
  });
};

// Helper function to get clips not assigned to any chain
export const getUnassignedClips = () => {
  const assignedClipIds = mockChains.flatMap(chain => 
    chain.clips.map(clip => clip.clipId)
  );
  
  return mockClipsForWorkspace.filter(clip => 
    !assignedClipIds.includes(clip._id)
  );
};

// Helper function to search chains
export const searchChains = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return mockChains.filter(chain => 
    chain.name.toLowerCase().includes(term) ||
    chain.description.toLowerCase().includes(term) ||
    chain.tags.some(tag => tag.toLowerCase().includes(term))
  );
};

// Helper function to search clips
export const searchClips = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return mockClipsForWorkspace.filter(clip => 
    clip.title.toLowerCase().includes(term) ||
    clip.description.toLowerCase().includes(term) ||
    clip.tags.some(tag => tag.toLowerCase().includes(term))
  );
};
