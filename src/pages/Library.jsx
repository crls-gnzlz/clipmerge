import React from 'react'
import { Link } from 'react-router-dom'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import Footer from '../components/Footer.jsx'

const Library = () => {
  // Mock data for library examples - in a real app, this would come from an API
  const libraryExamples = [
    {
      id: 'football-highlights',
      title: 'Football Match Highlights',
      description: 'Relive the most exciting moments from this thrilling football match with 4 spectacular goals.',
      clips: [
        {
          id: 1,
          title: "First Goal - Spectacular Strike",
          videoId: "19s1_a0wFmE",
          startTime: 4,
          endTime: 24
        },
        {
          id: 2,
          title: "Second Goal - Team Play",
          videoId: "19s1_a0wFmE",
          startTime: 310,
          endTime: 341
        },
        {
          id: 3,
          title: "Third Goal - Amazing Finish",
          videoId: "19s1_a0wFmE",
          startTime: 386,
          endTime: 417
        },
        {
          id: 4,
          title: "Fourth Goal - Match Winner",
          videoId: "19s1_a0wFmE",
          startTime: 428,
          endTime: 461
        }
      ],
      author: 'Sports Fan',
      createdAt: '2024-01-18',
      tags: ['Football', 'Sports', 'Highlights', 'Goals']
    },
    {
      id: 'react-fundamentals',
      title: 'React Fundamentals',
      description: 'Master the basics of React with this comprehensive collection covering hooks, components, and modern patterns.',
      clips: [
        {
          id: 1,
          title: "React Hooks Explained",
          videoId: "7xTGNNLPyMI",
          startTime: 120,
          endTime: 300
        },
        {
          id: 2,
          title: "useState Hook Deep Dive",
          videoId: "7xTGNNLPyMI",
          startTime: 300,
          endTime: 480
        },
        {
          id: 3,
          title: "useEffect Best Practices",
          videoId: "7xTGNNLPyMI",
          startTime: 480,
          endTime: 660
        },
        {
          id: 4,
          title: "Custom Hooks",
          videoId: "7xTGNNLPyMI",
          startTime: 660,
          endTime: 840
        }
      ],
      author: 'React Master',
      createdAt: '2024-01-15',
      tags: ['React', 'JavaScript', 'Frontend', 'Hooks']
    },
    {
      id: 'python-data-science',
      title: 'Python Data Science',
      description: 'Learn data science with Python through practical examples and real-world applications.',
      clips: [
        {
          id: 1,
          title: "Pandas Basics",
          videoId: "dcqPhpY7tWk",
          startTime: 60,
          endTime: 240
        },
        {
          id: 2,
          title: "Data Visualization with Matplotlib",
          videoId: "dcqPhpY7tWk",
          startTime: 240,
          endTime: 420
        },
        {
          id: 3,
          title: "NumPy Arrays",
          videoId: "dcqPhpY7tWk",
          startTime: 420,
          endTime: 600
        },
        {
          id: 4,
          title: "Data Cleaning Techniques",
          videoId: "dcqPhpY7tWk",
          startTime: 600,
          endTime: 780
        }
      ],
      author: 'Data Scientist',
      createdAt: '2024-01-12',
      tags: ['Python', 'Data Science', 'Pandas', 'NumPy']
    },
    {
      id: 'economics-basics',
      title: 'Economics Fundamentals',
      description: 'Understand the core principles of economics through engaging explanations and real-world examples.',
      clips: [
        {
          id: 1,
          title: "Supply and Demand",
          videoId: "V0tIOqU7m-c",
          startTime: 45,
          endTime: 225
        },
        {
          id: 2,
          title: "Market Equilibrium",
          videoId: "V0tIOqU7m-c",
          startTime: 225,
          endTime: 405
        },
        {
          id: 3,
          title: "Elasticity of Demand",
          videoId: "V0tIOqU7m-c",
          startTime: 405,
          endTime: 585
        },
        {
          id: 4,
          title: "Price Controls",
          videoId: "V0tIOqU7m-c",
          startTime: 585,
          endTime: 765
        }
      ],
      author: 'Economics Professor',
      createdAt: '2024-01-10',
      tags: ['Economics', 'Education', 'Finance', 'Business']
    },
    {
      id: 'javascript-modern',
      title: 'Modern JavaScript',
      description: 'Explore modern JavaScript features including ES6+, async/await, and functional programming.',
      clips: [
        {
          id: 1,
          title: "ES6+ Features",
          videoId: "W6NZfCO5SIk",
          startTime: 180,
          endTime: 360
        },
        {
          id: 2,
          title: "Async/Await Patterns",
          videoId: "W6NZfCO5SIk",
          startTime: 360,
          endTime: 540
        },
        {
          id: 3,
          title: "Promises Deep Dive",
          videoId: "W6NZfCO5SIk",
          startTime: 540,
          endTime: 720
        },
        {
          id: 4,
          title: "Functional Programming",
          videoId: "W6NZfCO5SIk",
          startTime: 720,
          endTime: 900
        }
      ],
      author: 'JS Expert',
      createdAt: '2024-01-08',
      tags: ['JavaScript', 'ES6', 'Async', 'Programming']
    },
    {
      id: 'machine-learning-intro',
      title: 'Machine Learning Basics',
      description: 'Introduction to machine learning concepts, algorithms, and practical applications.',
      clips: [
        {
          id: 1,
          title: "What is Machine Learning?",
          videoId: "KNAWp2S3w94",
          startTime: 30,
          endTime: 210
        },
        {
          id: 2,
          title: "Supervised vs Unsupervised Learning",
          videoId: "KNAWp2S3w94",
          startTime: 210,
          endTime: 390
        },
        {
          id: 3,
          title: "Linear Regression",
          videoId: "KNAWp2S3w94",
          startTime: 390,
          endTime: 570
        },
        {
          id: 4,
          title: "Classification Algorithms",
          videoId: "KNAWp2S3w94",
          startTime: 570,
          endTime: 750
        }
      ],
      author: 'ML Engineer',
      createdAt: '2024-01-05',
      tags: ['Machine Learning', 'AI', 'Data Science', 'Python']
    },
    {
      id: 'web-development',
      title: 'Web Development',
      description: 'Complete web development course covering HTML, CSS, and JavaScript fundamentals.',
      clips: [
        {
          id: 1,
          title: "HTML Structure",
          videoId: "UB1O30fR-EE",
          startTime: 60,
          endTime: 240
        },
        {
          id: 2,
          title: "CSS Styling",
          videoId: "UB1O30fR-EE",
          startTime: 240,
          endTime: 420
        },
        {
          id: 3,
          title: "JavaScript Basics",
          videoId: "UB1O30fR-EE",
          startTime: 420,
          endTime: 600
        },
        {
          id: 4,
          title: "Responsive Design",
          videoId: "UB1O30fR-EE",
          startTime: 600,
          endTime: 780
        }
      ],
      author: 'Web Developer',
      createdAt: '2024-01-03',
      tags: ['Web Development', 'HTML', 'CSS', 'JavaScript']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Clipchain library
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover curated clipchains created by our community. Find inspiration and learn from others.
            </p>
          </div>

          {/* Library Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraryExamples.map((example) => (
              <div key={example.id} className="w-full">
                <ClipchainPlayer
                  id={example.id}
                  title={example.title}
                  description={example.description}
                  clips={example.clips}
                  author={example.author}
                  createdAt={example.createdAt}
                  tags={example.tags}
                />
              </div>
            ))}
          </div>

          {/* Empty State (if no examples) */}
          {libraryExamples.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No examples yet</h3>
              <p className="text-gray-600 mb-6">
                Be the first to create and share a clipchain with the community!
              </p>
              <Link
                to="/create"
                className="inline-flex items-center px-6 py-3 bg-secondary-950 text-white rounded-lg font-medium hover:bg-secondary-900 transition-colors duration-200"
              >
                Create Your First Clipchain
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Library
