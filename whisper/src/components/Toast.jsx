import { useState, useCallback, useEffect } from 'react'

let toastHandler = null

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return { toasts, showToast }
}

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i
            className={`fas fa-${t.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}
            style={{ color: t.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: '0.95rem' }}
          />
          {t.message}
        </div>
      ))}
    </div>
  )
}
