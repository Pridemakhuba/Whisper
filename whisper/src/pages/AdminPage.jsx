import { useState, useEffect } from 'react'
import {
  db, postsCol, commentsCol, chatCol, usersCol,
  doc, getDocs, deleteDoc, query, orderBy,
} from '../lib/firebase.js'
import { formatTime } from '../lib/utils.js'
import { useToast, ToastContainer } from '../components/Toast.jsx'

const ADMIN_PASSWORD = '@Fade0303'

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('wn_adminLoggedIn') === 'true')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('posts')
  const [stats, setStats]   = useState({ users: 0, posts: 0, comments: 0, messages: 0 })
  const [data, setData]     = useState({ posts: [], users: [], comments: [], chat: [] })
  const [loading, setLoading] = useState(false)
  const { toasts, showToast } = useToast()

  useEffect(() => { if (loggedIn) loadAll() }, [loggedIn])

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('wn_adminLoggedIn', 'true')
      setLoggedIn(true)
    } else {
      showToast('Invalid password', 'error')
    }
  }

  function handleLogout() {
    localStorage.removeItem('wn_adminLoggedIn')
    setLoggedIn(false)
  }

  async function loadAll() {
    setLoading(true)
    try {
      const [postsSnap, usersSnap, commentsSnap, chatSnap] = await Promise.all([
        getDocs(query(postsCol(),    orderBy('timestamp', 'desc'))),
        getDocs(query(usersCol(),    orderBy('joined',    'desc'))),
        getDocs(query(commentsCol(), orderBy('timestamp', 'desc'))),
        getDocs(query(chatCol(),     orderBy('timestamp', 'desc'))),
      ])
      const posts    = postsSnap.docs.map(d    => ({ id: d.id,    ...d.data() }))
      const users    = usersSnap.docs.map(d    => ({ id: d.id,    ...d.data() }))
      const comments = commentsSnap.docs.map(d => ({ id: d.id,    ...d.data() }))
      const chat     = chatSnap.docs.map(d     => ({ id: d.id,    ...d.data() }))
      setData({ posts, users, comments, chat })
      setStats({ posts: posts.length, users: users.length, comments: comments.length, messages: chat.length })
    } catch (e) {
      console.error(e)
      showToast('Error loading data', 'error')
    }
    setLoading(false)
  }

  async function deletePost(id) {
    if (!confirm('Delete this post and all its comments?')) return
    try {
      // Delete the post doc
      await deleteDoc(doc(db, 'posts', id))
      // Also delete associated comments
      const snap = await getDocs(query(commentsCol()))
      const toDelete = snap.docs.filter(d => d.data().post_id === id)
      await Promise.all(toDelete.map(d => deleteDoc(d.ref)))
      showToast('Post deleted')
      loadAll()
    } catch (e) { showToast('Error deleting post', 'error') }
  }

  async function deleteComment(id) {
    if (!confirm('Delete this comment?')) return
    try {
      await deleteDoc(doc(db, 'comments', id))
      showToast('Comment deleted')
      loadAll()
    } catch (e) { showToast('Error deleting comment', 'error') }
  }

  async function deleteChatMessage(id) {
    if (!confirm('Delete this chat message?')) return
    try {
      await deleteDoc(doc(db, 'chat_messages', id))
      showToast('Message deleted')
      loadAll()
    } catch (e) { showToast('Error deleting message', 'error') }
  }

  // ── Login Screen ────────────────────────────────────────────
  if (!loggedIn) return (
    <>
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)', padding: 20
      }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '40px', maxWidth: 400, width: '100%',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'white', margin: '0 auto 14px',
              boxShadow: '0 4px 20px var(--accent-glow2)',
            }}>
              <i className="fas fa-shield-alt" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>Admin Panel</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 6 }}>WhisperNet Management Console</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
              <i className="fas fa-unlock" /> Login
            </button>
          </form>
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  )

  // ── Admin Panel ─────────────────────────────────────────────
  const tabs = [
    { id: 'posts',    label: 'Posts',    count: stats.posts    },
    { id: 'users',    label: 'Users',    count: stats.users    },
    { id: 'comments', label: 'Comments', count: stats.comments },
    { id: 'chat',     label: 'Chat',     count: stats.messages },
  ]

  const statCards = [
    { label: 'Total Users',    value: stats.users,    icon: 'fa-users',       color: 'var(--accent)'   },
    { label: 'Total Posts',    value: stats.posts,    icon: 'fa-scroll',      color: 'var(--accent-2)' },
    { label: 'Total Comments', value: stats.comments, icon: 'fa-comments',    color: 'var(--cyan)'     },
    { label: 'Chat Messages',  value: stats.messages, icon: 'fa-paper-plane', color: 'var(--pink)'     },
  ]

  return (
    <>
      <div className="admin-shell">
        {/* Topbar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: 'white',
            }}>
              <i className="fas fa-user-shield" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>WhisperNet Admin</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Firebase Console</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={loadAll} disabled={loading}>
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`} /> Refresh
            </button>
            <button className="btn btn-danger" style={{ fontSize: '0.8rem' }} onClick={handleLogout}>
              <i className="fas fa-sign-out-alt" /> Logout
            </button>
          </div>
        </div>

        <div className="page-container wide" style={{ paddingTop: 24 }}>
          {/* Stats */}
          <div className="stats-grid">
            {statCards.map(s => (
              <div key={s.label} className="stat-card">
                <i className={`fas ${s.icon} stat-icon`} style={{ color: s.color }} />
                <div className="stat-number">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
                <span className="tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <span className="loading-spinner" style={{ width: 22, height: 22 }} />
              </div>
            ) : (
              <>
                {activeTab === 'posts' && (
                  <table className="data-table">
                    <thead><tr>
                      <th>ID</th><th>Author</th><th>Content</th><th>Likes</th><th>Comments</th><th>Date</th><th>Action</th>
                    </tr></thead>
                    <tbody>
                      {data.posts.length === 0
                        ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-faint)' }}>No posts</td></tr>
                        : data.posts.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{p.id.substring(0,8)}…</td>
                            <td>{p.author}</td>
                            <td><span className="table-text-clip">{p.text}</span></td>
                            <td>{p.likes || 0}</td>
                            <td>{p.comments || 0}</td>
                            <td>{formatTime(p.timestamp)}</td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.76rem' }} onClick={() => deletePost(p.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                )}

                {activeTab === 'users' && (
                  <table className="data-table">
                    <thead><tr>
                      <th>ID</th><th>Username</th><th>Posts</th><th>Comments</th><th>Joined</th><th>Last Seen</th>
                    </tr></thead>
                    <tbody>
                      {data.users.length === 0
                        ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-faint)' }}>No users</td></tr>
                        : data.users.map(u => (
                          <tr key={u.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{u.id}</td>
                            <td>{u.username}</td>
                            <td>{u.post_count || 0}</td>
                            <td>{u.comment_count || 0}</td>
                            <td>{formatTime(u.joined)}</td>
                            <td>{formatTime(u.last_seen)}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                )}

                {activeTab === 'comments' && (
                  <table className="data-table">
                    <thead><tr>
                      <th>ID</th><th>Author</th><th>Content</th><th>Date</th><th>Action</th>
                    </tr></thead>
                    <tbody>
                      {data.comments.length === 0
                        ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-faint)' }}>No comments</td></tr>
                        : data.comments.map(c => (
                          <tr key={c.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{c.id.substring(0,8)}…</td>
                            <td>{c.author}</td>
                            <td><span className="table-text-clip">{c.text}</span></td>
                            <td>{formatTime(c.timestamp)}</td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.76rem' }} onClick={() => deleteComment(c.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                )}

                {activeTab === 'chat' && (
                  <table className="data-table">
                    <thead><tr>
                      <th>ID</th><th>Author</th><th>Message</th><th>Date</th><th>Action</th>
                    </tr></thead>
                    <tbody>
                      {data.chat.length === 0
                        ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-faint)' }}>No messages</td></tr>
                        : data.chat.map(m => (
                          <tr key={m.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{m.id.substring(0,8)}…</td>
                            <td>{m.author}</td>
                            <td><span className="table-text-clip">{m.text}</span></td>
                            <td>{formatTime(m.timestamp)}</td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.76rem' }} onClick={() => deleteChatMessage(m.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  )
}
