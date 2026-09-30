export const STORAGE_KEYS = {
    users: 'snail:users',
    session: 'snail:session',
} as const

export function readJson(key: string): unknown {
    try {
        const raw = localStorage.getItem(key)
        return raw === null ? null : JSON.parse(raw)
    } catch {
        return null
    }
}

export function writeJson(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key: string): void {
    localStorage.removeItem(key)
}