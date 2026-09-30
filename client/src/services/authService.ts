import type { RegisterForm, User } from '../types/auth'
import { normalizeFullName } from '../utils/validations'
import { hashPassword, verifyPassword } from './password'
import { clearSession, getSession, startSession } from './sessionStore'
import { findUserByEmail, findUserById, normalizeEmail, saveUser } from './userStore'


export class AuthError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'AuthError'
    }
}

export type RegisterData = Omit<RegisterForm, 'confirmPassword'>

export async function register(data: RegisterData): Promise<User> {
    const email = normalizeEmail(data.email)

    if (findUserByEmail(email)) {
        throw new AuthError('Ya existe una cuenta con este correo')
    }

    const { hash, salt } = await hashPassword(data.password)

    const user: User = {
        id: crypto.randomUUID(),
        fullName: normalizeFullName(data.fullName),
        email,
        passwordHash: hash,
        passwordSalt: salt,
        balance: 0,
        createdAt: new Date().toISOString(),
    }

    saveUser(user)
    startSession(user.id)
    return user
}

const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos'

export async function login(email: string, password: string): Promise<User> {
    const user = findUserByEmail(email)
    if (!user) throw new AuthError(INVALID_CREDENTIALS)

    const isValid = await verifyPassword(password, { hash: user.passwordHash, salt: user.passwordSalt })
    if (!isValid) throw new AuthError(INVALID_CREDENTIALS)

    startSession(user.id)
    return user
}

export function logout(): void {
    clearSession()
}

export function getCurrentUser(): User | null {
    const session = getSession()
    if (!session) return null

    const user = findUserById(session.userId)
    if (!user) {
        clearSession()
        return null
    }
    return user
}