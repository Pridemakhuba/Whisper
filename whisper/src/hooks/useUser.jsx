import { createContext, useContext, useState, useEffect } from 'react'
import { db, doc, setDoc, serverTimestamp } from '../lib/firebase.js'
import { generateUserId, generateUsername } from '../lib/utils.js'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => { initUser() }, [])

  async function initUser() {
    try {
      const id       = generateUserId()
      const username = generateUsername()

      await setDoc(doc(db, 'users', id), {
        username,
        joined:        serverTimestamp(),
        last_seen:     serverTimestamp(),
        post_count:    0,
        comment_count: 0,
      }, { merge: true })

      setCurrentUser({ uid: id, username })
    } catch (err) {
      console.error('initUser error', err)
      const username = generateUsername()
      setCurrentUser({
        uid: 'local_' + Math.random().toString(36).substring(2, 10),
        username,
      })
    } finally {
      setLoading(false)
    }
  }

  async function updateLastSeen() {
    if (!currentUser?.uid.startsWith('user_')) return
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { last_seen: serverTimestamp() },
        { merge: true }
      )
    } catch (e) { console.error('updateLastSeen:', e) }
  }

  return (
    <UserContext.Provider value={{ currentUser, loading, updateLastSeen }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
