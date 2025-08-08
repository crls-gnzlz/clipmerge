import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Library from './pages/Library.jsx'
import ClipchainLaunchpad from './pages/ClipchainLaunchpad.jsx'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/chain/:chainId" element={<ClipchainLaunchpad />} />
          <Route path="/collections" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Collections</h1>
              <p className="text-gray-600">Coming soon: Here you'll be able to view your clip collections.</p>
            </div>
          } />
          <Route path="/create" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Clip</h1>
              <p className="text-gray-600">Coming soon: Here you'll be able to create new video clips.</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
