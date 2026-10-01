import { useState, type ReactNode } from 'react'
import * as authService from '../services/authService'
import type { RegisterData } from '../services/authService'
import type { User } from '../types/auth'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => authService.getCurrentUser())

    async function register(data: RegisterData) {
        setUser(await authService.register(data))
    }

    async function login(email: string, password: string) {
        setUser(await authService.login(email, password))
    }

    function logout() {
        authService.logout()
        setUser(null)
    }

    function updateUser(updated: User) {
        setUser(updated)
    }

    return <AuthContext value={{ user, register, login, logout, updateUser }}>{children}</AuthContext>
}