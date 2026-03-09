import { useState } from 'react'

export default function WelcomeModal({ onEnter }) {
  const [notifChecked, setNotifChecked] = useState(false)

  function handleEnter() {
    if (notifChecked && 'Notification' in window) {
      Notification.requestPermission()
    }
    onEnter()
  }

  return (
    <div className="modal-overlay">
      <div className="welcome-modal">
        <div className="welcome-icon">
          <i className="fas fa-user-secret" />
        </div>
        <h1 className="welcome-title">WhisperNet</h1>
        <p className="welcome-subtitle">
          A space to share your thoughts, secrets, and confessions — completely anonymous. Your identity is protected.
        </p>

        <div className="welcome-features">
          <div className="welcome-feature">
            <i className="fas fa-mask" />
            <span>100% anonymous — no accounts, no tracking</span>
          </div>
          <div className="welcome-feature">
            <i className="fas fa-comments" />
            <span>Post confessions & join live anonymous chat</span>
          </div>
          <div className="welcome-feature">
            <i className="fas fa-heart" />
            <span>React to and comment on others' stories</span>
          </div>
        </div>

        <label className="consent-checkbox">
          <input
            type="checkbox"
            checked={notifChecked}
            onChange={e => setNotifChecked(e.target.checked)}
            style={{ width: 'auto', cursor: 'pointer' }}
          />
          <span>Notify me about new messages and activity</span>
        </label>

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handleEnter}>
          <i className="fas fa-door-open" /> Enter WhisperNet
        </button>
      </div>
    </div>
  )
}
