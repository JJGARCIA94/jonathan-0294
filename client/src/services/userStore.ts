import type { User } from '../types/auth'
import { readJson, STORAGE_KEYS, writeJson } from './storage'

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
}

export function getUsers(): User[] {
    const stored = readJson(STORAGE_KEYS.users)
    return Array.isArray(stored) ? (stored as User[]) : []
}

export function findUserByEmail(email: string): User | undefined {
    const normalized = normalizeEmail(email)
    return getUsers().find((user) => user.email === normalized)
}

export function findUserById(id: string): User | undefined {
    return getUsers().find((user) => user.id === id)
}

export function saveUser(user: User): void {
    const users = getUsers()
    const index = users.findIndex((existing) => existing.id === user.id)

    if (index === -1) {
        users.push(user)
    } else {
        users[index] = user
    }

    writeJson(STORAGE_KEYS.users, users)
}