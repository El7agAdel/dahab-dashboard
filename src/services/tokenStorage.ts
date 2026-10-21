export interface SessionTokens {
  accessToken: string
  refreshToken: string
}

interface StoredSession {
  refreshToken: string
  keepSignedIn: boolean
  signedInAt: number
  lastActiveAt: number
}

export const IDLE_LIMIT_MS = 12 * 60 * 60 * 1000 // without "Keep me signed in": 12 h without activity
export const KEEP_LIMIT_MS = 30 * 24 * 60 * 60 * 1000 // with it: 30 days from sign-in
const STORAGE_KEY = 'dahab.session'

// The access token never leaves memory (spec 4.1).
let accessToken: string | null = null
let lastKeepSignedIn = false

function read(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
  try {
    const session = raw ? (JSON.parse(raw) as StoredSession) : null
    return typeof session?.refreshToken === 'string' ? session : null
  } catch {
    return null // corrupted storage counts as signed out
  }
}

function write(session: StoredSession) {
  const storage = session.keepSignedIn ? localStorage : sessionStorage
  storage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const tokenStorage = {
  getAccessToken: () => accessToken,

  getRefreshToken(now = Date.now()): string | null {
    const session = read()
    if (!session) return null
    const expired = session.keepSignedIn
      ? now - session.signedInAt > KEEP_LIMIT_MS
      : now - session.lastActiveAt > IDLE_LIMIT_MS
    if (expired) tokenStorage.clear()
    return expired ? null : session.refreshToken
  },

  // The last session's mode survives clear(), so the session-expired dialog can keep it.
  isKeepSignedIn: () => lastKeepSignedIn,

  start(tokens: SessionTokens, keepSignedIn: boolean, now = Date.now()) {
    tokenStorage.clear()
    accessToken = tokens.accessToken
    lastKeepSignedIn = keepSignedIn
    write({ refreshToken: tokens.refreshToken, keepSignedIn, signedInAt: now, lastActiveAt: now })
  },

  // Every refresh returns a new refresh token (rotation): replace it, keep the mode and sign-in time.
  rotate(tokens: SessionTokens, now = Date.now()) {
    accessToken = tokens.accessToken
    const session = read()
    if (session) write({ ...session, refreshToken: tokens.refreshToken, lastActiveAt: now })
  },

  touch(now = Date.now()) {
    const session = read()
    if (session) write({ ...session, lastActiveAt: now })
  },

  clear() {
    accessToken = null
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  },
}
