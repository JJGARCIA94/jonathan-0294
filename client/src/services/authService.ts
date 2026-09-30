import type { RegisterForm, User } from '../types/auth'
import { normalizeFullName } from '../utils/validations'
import { hashPassword } from './password'
import { startSession } from './sessionStore'
import { findUserByEmail, normalizeEmail, saveUser } from './userStore'


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