import { createContext } from 'react'
import type { RegisterData } from '../services/authService'
import type { User } from '../types/auth'

export interface AuthContextValue {
    user: User | null
    register: (data: RegisterData) => Promise<void>
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)