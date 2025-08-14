export const mockClips = [
  {
    _id: 'clip_001',
    title: 'Introduction to React Hooks',
    description: 'Learn the basics of React Hooks including useState, useEffect, and custom hooks. Perfect for beginners who want to understand modern React development.',
    duration: 180, // 3 minutes
    startTime: 0,
    endTime: 180,
    tags: ['react', 'hooks', 'tutorial', 'frontend'],
    createdAt: '2024-01-15T10:30:00Z',
    status: 'public'
  },
  {
    _id: 'clip_002',
    title: 'Advanced TypeScript Patterns',
    description: 'Explore advanced TypeScript patterns like generics, utility types, and conditional types. Deep dive into type system capabilities.',
    duration: 240, // 4 minutes
    startTime: 0,
    endTime: 240,
    tags: ['typescript', 'advanced', 'patterns', 'types'],
    createdAt: '2024-01-14T14:20:00Z',
    status: 'public'
  },
  {
    _id: 'clip_003',
    title: 'CSS Grid Layout Mastery',
    description: 'Master CSS Grid Layout with practical examples. Learn grid areas, auto-fit, and responsive design techniques.',
    duration: 300, // 5 minutes
    startTime: 0,
    endTime: 300,
    tags: ['css', 'grid', 'layout', 'responsive'],
    createdAt: '2024-01-13T09:15:00Z',
    status: 'public'
  },
  {
    _id: 'clip_004',
    title: 'Node.js Performance Optimization',
    description: 'Learn how to optimize Node.js applications for better performance. Memory management, caching strategies, and profiling.',
    duration: 360, // 6 minutes
    startTime: 0,
    endTime: 360,
    tags: ['nodejs', 'performance', 'optimization', 'backend'],
    createdAt: '2024-01-12T16:45:00Z',
    status: 'public'
  },
  {
    _id: 'clip_005',
    title: 'MongoDB Aggregation Pipeline',
    description: 'Deep dive into MongoDB aggregation pipeline. Complex queries, data transformation, and performance considerations.',
    duration: 420, // 7 minutes
    startTime: 0,
    endTime: 420,
    tags: ['mongodb', 'aggregation', 'database', 'queries'],
    createdAt: '2024-01-11T11:30:00Z',
    status: 'public'
  },
  {
    _id: 'clip_006',
    title: 'Docker Containerization Best Practices',
    description: 'Learn Docker best practices for containerization. Multi-stage builds, security considerations, and deployment strategies.',
    duration: 300, // 5 minutes
    startTime: 0,
    endTime: 300,
    tags: ['docker', 'containers', 'devops', 'deployment'],
    createdAt: '2024-01-10T13:20:00Z',
    status: 'public'
  },
  {
    _id: 'clip_007',
    title: 'Git Workflow Strategies',
    description: 'Explore different Git workflow strategies including Git Flow, GitHub Flow, and trunk-based development.',
    duration: 240, // 4 minutes
    startTime: 0,
    endTime: 240,
    tags: ['git', 'workflow', 'version-control', 'collaboration'],
    createdAt: '2024-01-09T15:10:00Z',
    status: 'public'
  },
  {
    _id: 'clip_008',
    title: 'API Design Principles',
    description: 'Learn RESTful API design principles, authentication methods, and best practices for building scalable APIs.',
    duration: 360, // 6 minutes
    startTime: 0,
    endTime: 360,
    tags: ['api', 'rest', 'design', 'authentication'],
    createdAt: '2024-01-08T10:00:00Z',
    status: 'public'
  },
  {
    _id: 'clip_009',
    title: 'Testing with Jest and React Testing Library',
    description: 'Comprehensive guide to testing React applications with Jest and React Testing Library. Unit tests, integration tests, and best practices.',
    duration: 480, // 8 minutes
    startTime: 0,
    endTime: 480,
    tags: ['testing', 'jest', 'react-testing-library', 'unit-tests'],
    createdAt: '2024-01-07T14:30:00Z',
    status: 'public'
  },
  {
    _id: 'clip_010',
    title: 'State Management with Redux Toolkit',
    description: 'Modern Redux development with Redux Toolkit. Simplified state management, async actions, and performance optimization.',
    duration: 540, // 9 minutes
    startTime: 0,
    endTime: 540,
    tags: ['redux', 'state-management', 'toolkit', 'react'],
    createdAt: '2024-01-06T12:15:00Z',
    status: 'public'
  }
];

// Helper function to get clips sorted by creation date (most recent first)
export const getMockClipsSorted = () => {
  return [...mockClips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Helper function to get clips by tag
export const getMockClipsByTag = (tag) => {
  return mockClips.filter(clip => clip.tags.includes(tag));
};

// Helper function to search clips
export const searchMockClips = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return mockClips.filter(clip => 
    clip.title.toLowerCase().includes(term) ||
    clip.description.toLowerCase().includes(term) ||
    clip.tags.some(tag => tag.toLowerCase().includes(term))
  );
};

// Helper function to get unique tags
export const getMockUniqueTags = () => {
  const allTags = mockClips.flatMap(clip => clip.tags);
  return [...new Set(allTags)].sort();
};
