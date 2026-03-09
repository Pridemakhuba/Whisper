import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser.jsx'
import WelcomeModal from '../components/WelcomeModal.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import FeedSection from './FeedSection.jsx'
import ChatSection from './ChatSection.jsx'
import ProfileSection from './ProfileSection.jsx'
import { useToast, ToastContainer } from '../components/Toast.jsx'

export default function MainApp() {
  const { currentUser, loading } = useUser()
  const [showWelcome, setShowWelcome] = useState(false)
  const [activeSection, setActiveSection] = useState('feed')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toasts, showToast } = useToast()

  useEffect(() => {
    if (!localStorage.getItem('wn_welcomeSeen')) {
      setShowWelcome(true)
    }
  }, [])

  function handleEnter() {
    localStorage.setItem('wn_welcomeSeen', 'true')
    setShowWelcome(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 48, height: 48, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: 'white'
        }}>
          <i className="fas fa-user-secret" />
        </div>
        <span className="loading-spinner" style={{ width: 20, height: 20 }} />
        <span style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>Connecting anonymously…</span>
      </div>
    )
  }

  return (
    <>
      {showWelcome && <WelcomeModal onEnter={handleEnter} />}

      <div className="app-shell">
        <Sidebar
          activeSection={activeSection}
          onNav={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="main-content">
          <Topbar
            activeSection={activeSection}
            onMenuToggle={() => setSidebarOpen(v => !v)}
          />

          {activeSection === 'feed' && <FeedSection showToast={showToast} />}
          {activeSection === 'chat' && <ChatSection showToast={showToast} />}
          {activeSection === 'profile' && <ProfileSection />}
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  )
}
