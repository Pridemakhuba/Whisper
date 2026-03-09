// ── Shared utilities ────────────────────────────────────────

export function formatTime(date) {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  const diff = Date.now() - d.getTime()
  if (diff < 60000)    return 'Just now'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

export function generateUserId() {
  return 'user_' + Math.random().toString(36).substring(2, 10)
}

export function generateUsername() {
  const adjectives = ['Silent', 'Shadow', 'Mystic', 'Hidden', 'Veiled', 'Neon', 'Phantom', 'Dusk', 'Echo', 'Ghost', 'Crimson', 'Hollow', 'Faded', 'Void', 'Lunar']
  const nouns      = ['Whisper', 'Cipher', 'Specter', 'Raven', 'Drifter', 'Pulse', 'Wave', 'Signal', 'Voice', 'Shade', 'Mirage', 'Specter', 'Reverie', 'Drift', 'Glitch']
  const adj  = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num  = Math.floor(Math.random() * 999)
  return `${adj}${noun}${num}`
}
