import { useState, useEffect } from 'react'
import { db, postsCol, doc, getDoc, getDocs, query, orderBy, where, limit } from '../lib/firebase.js'
import { formatTime } from '../lib/utils.js'
import { useUser } from '../hooks/useUser.jsx'

export default function ProfileSection() {
  const { currentUser }         = useUser()
  const [stats, setStats]       = useState(null)
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (currentUser) loadStats()
  }, [currentUser])

  async function loadStats() {
    setLoading(true)
    try {
      if (currentUser.uid.startsWith('user_')) {
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid))
        if (userSnap.exists()) setStats(userSnap.data())

        const q    = query(postsCol(), where('author_id', '==', currentUser.uid), orderBy('timestamp', 'desc'), limit(5))
        const snap = await getDocs(q)
        setRecentPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  if (!currentUser) return null

  return (
    <div className="page-container">
      {/* Profile Card */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
          <div style={{
            width: 62, height: 62, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: 'white', flexShrink: 0,
            boxShadow: '0 4px 20px var(--accent-glow2)',
          }}>
            <i className="fas fa-ghost" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {currentUser.username}
            </div>
            <div style={{ marginTop: 5 }}>
              <span className="badge badge-accent">
                <i className="fas fa-shield-alt" /> Anonymous
              </span>
            </div>
          </div>
        </div>

        <div className="profile-stat-grid">
          <div className="profile-stat">
            <div className="profile-stat-value" style={{ color: 'var(--accent)' }}>
              {loading ? '—' : stats?.post_count ?? 0}
            </div>
            <div className="profile-stat-label">Confessions</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value" style={{ color: 'var(--accent-2)' }}>
              {loading ? '—' : stats?.comment_count ?? 0}
            </div>
            <div className="profile-stat-label">Comments</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="section-header">
          <h3 className="section-title">
            <i className="fas fa-history" style={{ marginRight: 8, color: 'var(--accent)' }} />
            Recent Confessions
          </h3>
          <button className="btn-ghost btn" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={loadStats}>
            <i className="fas fa-sync-alt" />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <span className="loading-spinner" style={{ width: 20, height: 20 }} />
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <span className="empty-state-icon"><i className="fas fa-feather" /></span>
            <div className="empty-state-title">No confessions yet</div>
            <div className="empty-state-desc">Head to the feed to post your first one</div>
          </div>
        ) : (
          recentPosts.map(p => (
            <div key={p.id} style={{ padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.55, marginBottom: 5 }}>
                {p.text.length > 120 ? p.text.substring(0, 120) + '…' : p.text}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.73rem', color: 'var(--text-faint)' }}>
                <span>{formatTime(p.timestamp)}</span>
                <span><i className="fas fa-heart" style={{ marginRight: 3, color: 'var(--pink)' }} />{p.likes || 0}</span>
                <span><i className="fas fa-comment" style={{ marginRight: 3 }} />{p.comments || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        marginTop: 14, padding: '10px 14px',
        background: 'var(--bg-3)', borderRadius: 'var(--radius)',
        fontSize: '0.78rem', color: 'var(--text-faint)', textAlign: 'center',
        border: '1px solid var(--border)',
      }}>
        <i className="fas fa-lock" style={{ marginRight: 6 }} />
        Your identity is fully anonymous. No personal data is stored.
      </div>
    </div>
  )
}
