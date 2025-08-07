import React from 'react'
import { Link } from 'react-router-dom'
import TestPlayerSection from '../components/TestPlayerSection.jsx'
import GettingStartedSection from '../components/GettingStartedSection.jsx'
import TutorialsSection from '../components/TutorialsSection.jsx'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content - Two Columns */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Test Player Section */}
          <div className="order-2 lg:order-1">
            <TestPlayerSection />
          </div>
          
          {/* Right Column - Getting Started Section */}
          <div className="order-1 lg:order-2">
            <GettingStartedSection />
          </div>
        </div>

        {/* Full Width - Tutorials Section */}
        <div className="w-full">
          <TutorialsSection />
        </div>
      </div>
    </div>
  )
}

export default Home
