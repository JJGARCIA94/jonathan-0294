import type { Session } from '../types/auth'
import { readJson, removeItem, STORAGE_KEYS, writeJson } from './storage'

export function getSession(): Session | null {
    const stored = readJson(STORAGE_KEYS.session)
    return isSession(stored) ? stored : null
}

export function startSession(userId: string): Session {
    const session: Session = { userId }
    writeJson(STORAGE_KEYS.session, session)
    return session
}

export function clearSession(): void {
    removeItem(STORAGE_KEYS.session)
}

function isSession(value: unknown): value is Session {
    return typeof value === 'object' && value !== null && typeof (value as Session).userId === 'string'
}