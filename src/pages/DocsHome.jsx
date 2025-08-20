import React, { useState, useMemo, useRef, useEffect } from 'react'

const sidebarLinks = [
  { section: 'GETTING STARTED', links: [ { label: 'Quick Start', href: '#quick-start' } ] },
  { section: 'FEATURES', links: [
    { label: 'Overview', href: '#overview' },
    { label: 'Clipchain Players', href: '#clipchain-players' },
    { label: 'Embedding player', href: '#embedding-player' },
    { label: 'Custom pages', href: '#custom-pages' },
  ] },
  { section: 'CONFIGURATION', links: [
    { label: 'Settings', href: '#settings' },
  ] },
]

const docsContent = [
  { id: 'quick-start', type: 'h1', text: 'Quick Start' },
  { id: 'quick-start-desc', type: 'p', text: 'Your first steps with Clipchain, including the initial setup and questionnaire.' },
  { id: 'first-steps', type: 'h2', text: 'First Steps' },
  { id: 'first-steps-list', type: 'ol', items: [
    `Create an Account: Sign up for a free account. You'll get up to 5 chains to start curating your content.`,
    'Create your chains: Select video moments and create your clipchains to share and include in other websites.',
    'Embed chains: Use our embedding options to include your chains with our ClipChainPlayer in any website, and also create your own custom landing pages.'
  ] },
  { id: 'overview', type: 'h1', text: 'Overview' },
  { id: 'overview-desc', type: 'p', text: 'Clipchain lets you organize, merge, and share video moments easily.' },
  { id: 'clipchain-players', type: 'h2', text: 'Clipchain Players' },
  { id: 'clipchain-players-desc', type: 'p', text: 'Embed interactive players in your site or app.' },
  { id: 'embedding-player', type: 'h2', text: 'Embedding player' },
  { id: 'embedding-player-desc', type: 'p', text: 'How to embed a player in your blog or website.' },
  { id: 'custom-pages', type: 'h2', text: 'Custom pages' },
  { id: 'custom-pages-desc', type: 'p', text: 'Create custom landing pages for your collections.' },
  { id: 'settings', type: 'h1', text: 'Settings' },
  { id: 'settings-desc', type: 'p', text: 'Manage your account and workspace settings.' },
]

function highlight(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-primary-100 text-primary-700">{part}</mark> : part
  )
}

const DocsHome = () => {
  const [search, setSearch] = useState('')
  const contentRef = useRef(null)
  // Full-text search: filtra links y contenido
  const filteredLinks = useMemo(() => {
    if (!search) return sidebarLinks
    const q = search.toLowerCase()
    return sidebarLinks.map(section => ({
      ...section,
      links: section.links.filter(link =>
        link.label.toLowerCase().includes(q) ||
        docsContent.some(c => c.id === link.href.replace('#','') && c.text && c.text.toLowerCase().includes(q))
      )
    })).filter(section => section.links.length > 0)
  }, [search])

  const filteredContent = useMemo(() => {
    if (!search) return docsContent
    const q = search.toLowerCase()
    return docsContent.filter(c =>
      (c.text && c.text.toLowerCase().includes(q)) ||
      (c.items && c.items.some(item => item.toLowerCase().includes(q)))
    )
  }, [search])

  // Table of Contents (ToC): H1 y H2 visibles
  const toc = useMemo(() =>
    filteredContent.filter(c => c.type === 'h1' || c.type === 'h2').map(c => ({ id: c.id, text: c.text, type: c.type })),
    [filteredContent]
  )

  // Scroll suave al hacer click en ToC o sidebar
  useEffect(() => {
    const handleClick = e => {
      if (e.target.tagName === 'A' && e.target.hash) {
        const el = document.getElementById(e.target.hash.replace('#',''))
        if (el) {
          e.preventDefault()
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md flex flex-col justify-between h-screen sticky top-0">
        <div>
          <div className="h-full py-8 px-6">
            <div className="mb-8 flex items-center gap-2">
              <img src="/logo-letters-blue.svg" alt="clipchain" className="h-6 w-auto" />
              <span className="text-xs text-primary-600 font-bold tracking-wide uppercase">Docs</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search docs..."
              className="w-full mb-6 px-3 py-2 border border-primary-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <nav className="space-y-8 overflow-y-auto max-h-[60vh]">
              {filteredLinks.map(section => (
                <div key={section.section}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wider">{section.section}</h3>
                  <ul className="space-y-1">
                    {section.links.map(link => (
                      <li key={link.label}>
                        <a href={link.href} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                          {highlight(link.label, search)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
        {/* App access menu at the bottom */}
        <div className="px-6 pb-8">
          <a href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors border border-primary-100 shadow-sm">
            <img src="/logo-letters-blue.svg" alt="clipchain" className="h-6 w-auto" />
            <span className="text-primary-700 font-semibold text-sm">Go to App</span>
          </a>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 px-12 py-16" ref={contentRef}>
        <div className="max-w-3xl mx-auto">
          {filteredContent.map((c, i) => {
            if (c.type === 'h1') return <h1 id={c.id} key={c.id} className="text-3xl font-bold text-gray-900 mb-6 mt-12 scroll-mt-24">{highlight(c.text, search)}</h1>
            if (c.type === 'h2') return <h2 id={c.id} key={c.id} className="text-xl font-semibold text-gray-900 mb-4 mt-10 scroll-mt-24">{highlight(c.text, search)}</h2>
            if (c.type === 'p') return <p key={c.id} className="text-gray-600 mb-8 text-lg">{highlight(c.text, search)}</p>
            if (c.type === 'ol') return (
              <ol key={c.id} className="space-y-4 mb-12">
                {c.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 font-bold">{idx+1}</span>
                    <div>{highlight(item, search)}</div>
                  </li>
                ))}
              </ol>
            )
            return null
          })}
        </div>
      </main>
      {/* Table of Contents (ToC) */}
      <nav className="hidden lg:block w-64 flex-shrink-0 px-6 py-16 sticky top-0 h-screen overflow-y-auto">
        <div className="max-w-xs mx-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wider">On this page</h3>
          <ul className="space-y-2">
            {toc.map(item => (
              <li key={item.id} className="ml-{item.type==='h2'?4:0}">
                <a href={`#${item.id}`} className={`block text-sm px-2 py-1 rounded hover:bg-primary-50 hover:text-primary-700 transition-colors ${item.type==='h2' ? 'ml-4' : ''}`}>{item.text}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default DocsHome
