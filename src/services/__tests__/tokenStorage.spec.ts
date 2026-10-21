import { beforeEach, expect, it } from 'vitest'

import { IDLE_LIMIT_MS, KEEP_LIMIT_MS, tokenStorage } from '@/services/tokenStorage'

const tokens = { accessToken: 'access-1', refreshToken: 'refresh-1' }

beforeEach(() => {
  tokenStorage.clear()
  localStorage.clear()
  sessionStorage.clear()
})

it('keeps the refresh token in localStorage with Keep me signed in', () => {
  tokenStorage.start(tokens, true)

  expect(localStorage.getItem('dahab.session')).toContain('refresh-1')
  expect(sessionStorage.getItem('dahab.session')).toBeNull()
})

it('uses sessionStorage without it', () => {
  tokenStorage.start(tokens, false)

  expect(sessionStorage.getItem('dahab.session')).toContain('refresh-1')
  expect(localStorage.getItem('dahab.session')).toBeNull()
})

it('never writes the access token to storage', () => {
  tokenStorage.start(tokens, true)

  expect(tokenStorage.getAccessToken()).toBe('access-1')
  expect(localStorage.getItem('dahab.session')).not.toContain('access-1')
})

it('rotation replaces the refresh token and keeps the mode', () => {
  tokenStorage.start(tokens, true)
  tokenStorage.rotate({ accessToken: 'access-2', refreshToken: 'refresh-2' })

  expect(tokenStorage.getAccessToken()).toBe('access-2')
  expect(tokenStorage.getRefreshToken()).toBe('refresh-2')
  expect(localStorage.getItem('dahab.session')).toContain('refresh-2')
})

it('expires after 12 h idle without Keep me signed in', () => {
  tokenStorage.start(tokens, false, 0)

  expect(tokenStorage.getRefreshToken(IDLE_LIMIT_MS)).toBe('refresh-1')
  expect(tokenStorage.getRefreshToken(IDLE_LIMIT_MS + 1)).toBeNull()
  expect(sessionStorage.getItem('dahab.session')).toBeNull()
})

it('activity extends the idle window', () => {
  tokenStorage.start(tokens, false, 0)
  tokenStorage.touch(IDLE_LIMIT_MS)

  expect(tokenStorage.getRefreshToken(IDLE_LIMIT_MS * 2)).toBe('refresh-1')
})

it('Keep me signed in ends 30 days after sign-in even when active', () => {
  tokenStorage.start(tokens, true, 0)
  tokenStorage.touch(KEEP_LIMIT_MS)

  expect(tokenStorage.getRefreshToken(KEEP_LIMIT_MS)).toBe('refresh-1')
  expect(tokenStorage.getRefreshToken(KEEP_LIMIT_MS + 1)).toBeNull()
})

it('remembers the last mode after clear', () => {
  tokenStorage.start(tokens, true)
  tokenStorage.clear()

  expect(tokenStorage.getRefreshToken()).toBeNull()
  expect(tokenStorage.isKeepSignedIn()).toBe(true)
})

it('remembers Keep me signed in for a session restored after a reload', () => {
  tokenStorage.start(tokens, false) // this tab's memory says "not kept"…
  tokenStorage.clear()
  const stored = { refreshToken: 'refresh-1', keepSignedIn: true, signedInAt: 0, lastActiveAt: 0 }
  localStorage.setItem('dahab.session', JSON.stringify(stored)) // …but the reloaded session is kept

  expect(tokenStorage.getRefreshToken(0)).toBe('refresh-1')
  tokenStorage.clear()
  expect(tokenStorage.isKeepSignedIn()).toBe(true)
})

it('treats corrupted storage as signed out', () => {
  localStorage.setItem('dahab.session', '{not json')
  expect(tokenStorage.getRefreshToken()).toBeNull()

  localStorage.setItem('dahab.session', JSON.stringify({ refreshToken: 42 }))
  expect(tokenStorage.getRefreshToken()).toBeNull()
})
