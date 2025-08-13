import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Library from './pages/Library.jsx'
import ClipchainLaunchpad from './pages/ClipchainLaunchpad.jsx'
import LandingPage from './pages/LandingPage.jsx'
import CreateClip from './pages/CreateClip.jsx'
import CreateChain from './pages/CreateChain.jsx'
import EmbedPage from './pages/EmbedPage.jsx'
import EditChain from './pages/EditChain.jsx'
import CustomPage from './pages/CustomPage.jsx'
import DatabaseTest from './pages/DatabaseTest.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

function App() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/landing'
  const isEmbedPage = location.pathname.startsWith('/embed/')
  const isCustomPage = location.pathname === '/custom'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isPublicPage = isLandingPage || location.pathname.startsWith('/chain/')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Header on public pages, not on main app pages with sidebar */}
      {isPublicPage && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="/create-chain" element={<CreateChain />} />
          <Route path="/database-test" element={<DatabaseTest />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
