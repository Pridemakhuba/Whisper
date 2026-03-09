import { useState, useEffect, useRef } from 'react'
import {
  db, chatCol,
  addDoc, query, orderBy, limit, onSnapshot, serverTimestamp,
} from '../lib/firebase.js'
import { formatTime } from '../lib/utils.js'
import { useUser } from '../hooks/useUser.jsx'

const EMOJIS = ['😊','😂','🥰','😍','🤔','😎','👍','❤️','🔥','✨','🎉','💯','🙏','😢','😡','🤯']

export default function ChatSection({ showToast }) {
  const { currentUser }         = useUser()
  const [messages, setMessages] = useState([])
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(true)
  const [sending, setSending]   = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    // Real-time listener — updates instantly when new messages arrive
    const q = query(chatCol(), orderBy('timestamp', 'asc'), limit(100))
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, err => {
      console.error('chat listener error', err)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const msg = text.trim()
    if (!msg || !currentUser || sending) return
    setSending(true)
    try {
      await addDoc(chatCol(), {
        text:      msg,
        author:    currentUser.username,
        author_id: currentUser.uid,
        timestamp: serverTimestamp(),
      })
      setText('')
      inputRef.current?.focus()
    } catch (e) {
      showToast?.('Failed to send message', 'error')
    }
    setSending(false)
  }

  return (
    <div className="page-container">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header-bar">
          <div className="live-dot" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem' }}>
            Live Anonymous Chat
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
            Real-time
          </span>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, margin: 'auto' }}>
              <span className="loading-spinner" style={{ width: 20, height: 20 }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state" style={{ margin: 'auto' }}>
              <span className="empty-state-icon"><i className="fas fa-comments" /></span>
              <div className="empty-state-title">No messages yet</div>
              <div className="empty-state-desc">Start the conversation!</div>
            </div>
          ) : (
            messages.map(m => {
              const isOwn = m.author_id === currentUser?.uid
              return (
                <div key={m.id} className={`message ${isOwn ? 'own' : ''}`}>
                  <div className="msg-avatar">
                    <i className={`fas fa-${isOwn ? 'ghost' : 'user'}`} />
                  </div>
                  <div className="message-bubble">
                    <div className="message-sender">{isOwn ? 'You' : m.author}</div>
                    <div className="message-text">{m.text}</div>
                    <div className="message-time">{formatTime(m.timestamp)}</div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-row" style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message…"
          />
          <button className="btn-icon" onClick={() => setShowEmoji(v => !v)} title="Emoji">😊</button>
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={sending || !text.trim()}
            style={{ padding: '10px 16px', flexShrink: 0 }}
          >
            {sending
              ? <span className="loading-spinner" />
              : <i className="fas fa-paper-plane" />
            }
          </button>
          {showEmoji && (
            <div className="emoji-picker" style={{ bottom: '110%', right: 0 }}>
              <div className="emoji-grid">
                {EMOJIS.map(e => (
                  <button key={e} className="emoji-btn-item"
                    onClick={() => { setText(t => t + e); setShowEmoji(false) }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
