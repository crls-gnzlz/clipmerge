import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Library from './pages/Library.jsx'
import ClipchainLaunchpad from './pages/ClipchainLaunchpad.jsx'
import LandingPage from './pages/LandingPage.jsx'
import CreateClip from './pages/CreateClip.jsx'
import EmbedPage from './pages/EmbedPage.jsx'
import EditChain from './pages/EditChain.jsx'
import CustomPage from './pages/CustomPage.jsx'

function App() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/landing'
  const isEmbedPage = location.pathname.startsWith('/embed/')
  const isCustomPage = location.pathname === '/custom'

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLandingPage && !isEmbedPage && !isCustomPage && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/chain/:chainId" element={<ClipchainLaunchpad />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/custom" element={<CustomPage />} />
          <Route path="/embed/:chainId" element={<EmbedPage />} />
          <Route path="/edit-chain/:chainId" element={<EditChain />} />
          <Route path="/collections" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Collections</h1>
              <p className="text-gray-600">Coming soon: Here you'll be able to view your clip collections.</p>
            </div>
          } />
          <Route path="/create" element={<CreateClip />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
