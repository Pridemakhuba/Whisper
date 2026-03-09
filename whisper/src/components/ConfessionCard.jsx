import { useState } from 'react'
import {
  db, commentsCol, doc,
  addDoc, getDocs, updateDoc,
  query, orderBy, where, increment, serverTimestamp,
} from '../lib/firebase.js'
import { formatTime } from '../lib/utils.js'
import { useUser } from '../hooks/useUser.jsx'

const EMOJIS = ['😊','😂','🥰','😍','🤔','😎','👍','❤️','🔥','✨','🎉','💯','🙏','😢','😡','🤯']

export default function ConfessionCard({ post, likedPosts, onLike, onOpenFull, showToast }) {
  const { currentUser } = useUser()
  const [showComments, setShowComments]   = useState(false)
  const [comments, setComments]           = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText]     = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [showEmoji, setShowEmoji]         = useState(false)
  const isLiked = likedPosts[post.id]

  async function toggleComments() {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true)
      try {
        const q    = query(commentsCol(), where('post_id', '==', post.id), orderBy('timestamp', 'asc'))
        const snap = await getDocs(q)
        setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.error(e) }
      setLoadingComments(false)
    }
    setShowComments(v => !v)
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
        post_id:   post.id,
        timestamp: serverTimestamp(),
      })
      await updateDoc(doc(db, 'posts', post.id), { comments: increment(1) })
      if (currentUser.uid.startsWith('user_')) {
        await updateDoc(doc(db, 'users', currentUser.uid), { comment_count: increment(1) })
      }
      setCommentText('')
      // Reload comments
      const q    = query(commentsCol(), where('post_id', '==', post.id), orderBy('timestamp', 'asc'))
      const snap = await getDocs(q)
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      showToast?.('Comment posted!')
    } catch (e) {
      console.error(e)
      showToast?.('Failed to post comment', 'error')
    }
    setSubmitting(false)
  }

  return (
    <div className="confession-card">
      <div className="confession-header">
        <div className="confession-avatar"><i className="fas fa-user-secret" /></div>
        <div className="confession-meta">
          <div className="confession-author">{post.author}</div>
          <div className="confession-time">{formatTime(post.timestamp)}</div>
        </div>
        <span className="badge badge-accent">{post.type || 'confession'}</span>
      </div>

      <div className="confession-body">{post.text}</div>

      <div className="confession-actions">
        <button
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
          title={isLiked ? 'Already liked' : 'Like'}
        >
          <i className="fas fa-heart" />
          <span>{post.likes || 0}</span>
        </button>

        <button className="action-btn" onClick={toggleComments}>
          <i className="fas fa-comment" />
          <span>{post.comments || 0}</span>
        </button>

        <button className="action-btn" onClick={() => onOpenFull(post.id)} style={{ marginLeft: 'auto' }}>
          <i className="fas fa-expand-alt" />
          <span>Expand</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: 14 }}>
              <span className="loading-spinner" />
            </div>
          ) : comments.length === 0 ? (
            <div style={{ color: 'var(--text-faint)', fontSize: '0.83rem', textAlign: 'center', padding: '10px 0' }}>
              No comments yet — be first!
            </div>
          ) : (
            <div className="comments-list">
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
        </div>
      )}
    </div>
  )
}
