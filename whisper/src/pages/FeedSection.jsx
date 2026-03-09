import { useState, useEffect, useRef } from 'react'
import {
  db, postsCol, doc,
  addDoc, updateDoc, getDocs,
  query, orderBy, increment, serverTimestamp,
} from '../lib/firebase.js'
import { formatTime } from '../lib/utils.js'
import { useUser } from '../hooks/useUser.jsx'
import ConfessionCard from '../components/ConfessionCard.jsx'
import FullViewModal from '../components/FullViewModal.jsx'

const EMOJIS = ['😊','😂','🥰','😍','🤔','😎','👍','❤️','🔥','✨','🎉','💯','🙏','😢','😡','🤯']
const MAX_CHARS = 500

export default function FeedSection({ showToast }) {
  const { currentUser } = useUser()
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [postText, setPostText]   = useState('')
  const [posting, setPosting]     = useState(false)
  const [likedPosts, setLikedPosts] = useState(() =>
    JSON.parse(localStorage.getItem('wn_liked_posts') || '{}')
  )
  const [fullViewId, setFullViewId] = useState(null)
  const [showEmoji, setShowEmoji]   = useState(false)
  const emojiRef = useRef(null)

  useEffect(() => {
    loadPosts()
    const handler = e => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const q    = query(postsCol(), orderBy('timestamp', 'desc'))
      const snap = await getDocs(q)
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setPosts(rows)
    } catch (e) {
      console.error('loadPosts error', e)
      showToast?.('Failed to load posts', 'error')
    }
    setLoading(false)
  }

  async function createPost() {
    const text = postText.trim()
    if (!text)               { showToast?.('Please write something first', 'error'); return }
    if (text.length > MAX_CHARS) { showToast?.('Post is too long', 'error'); return }
    if (!currentUser)        return
    setPosting(true)
    try {
      await addDoc(postsCol(), {
        text,
        author:    currentUser.username,
        author_id: currentUser.uid,
        timestamp: serverTimestamp(),
        likes:     0,
        comments:  0,
        type:      'confession',
      })
      // bump user post count
      if (currentUser.uid.startsWith('user_')) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          post_count: increment(1),
        })
      }
      setPostText('')
      await loadPosts()
      showToast?.('Confession posted!')
    } catch (e) {
      console.error(e)
      showToast?.('Failed to post confession', 'error')
    }
    setPosting(false)
  }

  async function likePost(postId) {
    if (!currentUser || likedPosts[postId]) {
      if (likedPosts[postId]) showToast?.('Already liked!', 'error')
      return
    }
    try {
      await updateDoc(doc(db, 'posts', postId), { likes: increment(1) })
      const newLiked = { ...likedPosts, [postId]: true }
      setLikedPosts(newLiked)
      localStorage.setItem('wn_liked_posts', JSON.stringify(newLiked))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    } catch (e) { console.error(e) }
  }

  const charCount = postText.length
  const charClass = charCount > MAX_CHARS ? 'danger' : charCount > MAX_CHARS * 0.85 ? 'warning' : ''

  return (
    <div className="page-container">
      {/* Composer */}
      <div className="post-composer">
        <div className="composer-header">
          <div className="confession-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            <i className="fas fa-user-secret" />
          </div>
          <span className="composer-label">New Confession</span>
        </div>
        <textarea
          className="composer-textarea"
          value={postText}
          onChange={e => setPostText(e.target.value)}
          placeholder="What's on your mind? Share anonymously…"
          onKeyDown={e => e.ctrlKey && e.key === 'Enter' && createPost()}
        />
        <div className="composer-footer">
          <div className="composer-tools" ref={emojiRef}>
            <button className="btn-icon" onClick={() => setShowEmoji(v => !v)} title="Add emoji">😊</button>
            {showEmoji && (
              <div className="emoji-picker" style={{ bottom: '110%', left: 0 }}>
                <div className="emoji-grid">
                  {EMOJIS.map(e => (
                    <button key={e} className="emoji-btn-item"
                      onClick={() => { setPostText(t => t + e); setShowEmoji(false) }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <span className={`char-count ${charClass}`}>{charCount}/{MAX_CHARS}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={createPost}
            disabled={posting || !postText.trim() || charCount > MAX_CHARS}
          >
            {posting
              ? <><span className="loading-spinner" /> Posting…</>
              : <><i className="fas fa-feather-alt" /> Post Confession</>
            }
          </button>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 160, borderRadius: 'var(--radius-lg)' }} className="loading-skeleton" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon"><i className="fas fa-ghost" /></span>
          <div className="empty-state-title">Nothing here yet</div>
          <div className="empty-state-desc">Be the first to share a confession</div>
        </div>
      ) : (
        <div className="feed">
          {posts.map(post => (
            <ConfessionCard
              key={post.id}
              post={post}
              likedPosts={likedPosts}
              onLike={likePost}
              onOpenFull={setFullViewId}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {fullViewId && (
        <FullViewModal
          postId={fullViewId}
          likedPosts={likedPosts}
          onLike={likePost}
          onClose={() => setFullViewId(null)}
          showToast={showToast}
        />
      )}
    </div>
  )
}
