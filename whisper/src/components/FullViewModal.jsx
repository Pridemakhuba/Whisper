import { useState, useEffect } from 'react'
import {
  db, commentsCol, doc,
  addDoc, getDoc, getDocs, updateDoc,
  query, orderBy, where, increment, serverTimestamp,
} from '../lib/firebase.js'
import { formatTime } from '../lib/utils.js'
import { useUser } from '../hooks/useUser.jsx'

const EMOJIS = ['😊','😂','🥰','😍','🤔','😎','👍','❤️','🔥','✨','🎉','💯','🙏','😢','😡','🤯']

export default function FullViewModal({ postId, likedPosts, onLike, onClose, showToast }) {
  const { currentUser }             = useUser()
  const [post, setPost]             = useState(null)
  const [comments, setComments]     = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showEmoji, setShowEmoji]   = useState(false)

  useEffect(() => {
    loadPost()
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [postId])

  async function loadPost() {
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, 'posts', postId))
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() })
      await loadComments()
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function loadComments() {
    const q    = query(commentsCol(), where('post_id', '==', postId), orderBy('timestamp', 'asc'))
    const snap = await getDocs(q)
    setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  async function submitComment() {
    const text = commentText.trim()
    if (!text || !currentUser || submitting) return
    setSubmitting(true)
    try {
      await addDoc(commentsCol(), {
        text,
        author:    currentUser.username,
        author_id: currentUser.uid,
        post_id:   postId,
        timestamp: serverTimestamp(),
      })
      await updateDoc(doc(db, 'posts', postId), { comments: increment(1) })
      if (currentUser.uid.startsWith('user_')) {
        await updateDoc(doc(db, 'users', currentUser.uid), { comment_count: increment(1) })
      }
      setCommentText('')
      await loadComments()
      setPost(p => p ? { ...p, comments: (p.comments || 0) + 1 } : p)
      showToast?.('Comment posted!')
    } catch (e) {
      showToast?.('Failed to post comment', 'error')
    }
    setSubmitting(false)
  }

  const isLiked = likedPosts[postId]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="full-view-modal">
        <button className="btn-icon full-view-close" onClick={onClose}>
          <i className="fas fa-times" />
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span className="loading-spinner" style={{ width: 24, height: 24 }} />
          </div>
        ) : !post ? (
          <div className="empty-state"><p>Post not found</p></div>
        ) : (
          <>
            <div className="confession-header" style={{ marginBottom: 16 }}>
              <div className="confession-avatar"><i className="fas fa-user-secret" /></div>
              <div className="confession-meta">
                <div className="confession-author">{post.author}</div>
                <div className="confession-time">{formatTime(post.timestamp)}</div>
              </div>
            </div>

            <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: 20, color: 'var(--text-2)', whiteSpace: 'pre-wrap' }}>
              {post.text}
            </p>

            <div className="confession-actions" style={{ marginBottom: 20 }}>
              <button
                className={`action-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => onLike(postId)}
              >
                <i className="fas fa-heart" /> {post.likes || 0} Likes
              </button>
              <button className="action-btn">
                <i className="fas fa-comment" /> {post.comments || 0} Comments
              </button>
            </div>

            <div className="divider" />

            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Comments
            </h4>

            {comments.length === 0 ? (
              <div style={{ color: 'var(--text-faint)', fontSize: '0.84rem', marginBottom: 16 }}>No comments yet.</div>
            ) : (
              <div className="comments-list" style={{ marginBottom: 16 }}>
                {comments.map(c => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-avatar"><i className="fas fa-user" /></div>
                    <div className="comment-content">
                      <span className="comment-author">{c.author}</span>
                      <div className="comment-text">{c.text}</div>
                      <div className="comment-time">{formatTime(c.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="comment-input-row" style={{ position: 'relative' }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                onKeyDown={e => e.key === 'Enter' && submitComment()}
              />
              <button className="btn-icon" onClick={() => setShowEmoji(v => !v)}>😊</button>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 14px', flexShrink: 0 }}
                onClick={submitComment}
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? <span className="loading-spinner" /> : 'Post'}
              </button>
              {showEmoji && (
                <div className="emoji-picker" style={{ bottom: '110%', left: 0 }}>
                  <div className="emoji-grid">
                    {EMOJIS.map(e => (
                      <button key={e} className="emoji-btn-item"
                        onClick={() => { setCommentText(t => t + e); setShowEmoji(false) }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
