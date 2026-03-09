import { useState, useEffect } from 'react'

const sectionTitles = {
  feed:    'News Feed',
  chat:    'Live Chat',
  profile: 'My Profile',
}

export default function Topbar({ activeSection, onMenuToggle }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('wn_theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('wn_theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="btn-icon mobile-menu-btn" onClick={onMenuToggle} aria-label="Menu">
          <i className="fas fa-bars" />
        </button>
        <span className="topbar-title">{sectionTitles[activeSection] || ''}</span>
      </div>
      <div className="topbar-right">
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`} />
        </button>
      </div>
    </div>
  )
}
