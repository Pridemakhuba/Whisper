import { useUser } from '../hooks/useUser.jsx'

const navItems = [
  { id: 'feed',    icon: 'fa-home',     label: 'News Feed' },
  { id: 'chat',    icon: 'fa-comments', label: 'Live Chat' },
  { id: 'profile', icon: 'fa-user',     label: 'My Profile' },
]

export default function Sidebar({ activeSection, onNav, isOpen, onClose }) {
  const { currentUser } = useUser()

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon"><i className="fas fa-user-secret" /></div>
            <span className="brand-name">WhisperNet</span>
          </div>
          <div className="brand-tagline">speak freely. stay hidden.</div>
        </div>

        <ul className="sidebar-nav">
          {navItems.map(item => (
            <li
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => { onNav(item.id); onClose(); }}
            >
              <span className="nav-icon"><i className={`fas ${item.icon}`} /></span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar"><i className="fas fa-ghost" /></div>
            <div className="user-name">{currentUser?.username || 'Connecting…'}</div>
            <div className="online-dot" title="Online" />
          </div>
        </div>
      </aside>
    </>
  )
}
