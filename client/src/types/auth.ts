export interface User {
    id: string
    fullName: string
    email: string
    passwordHash: string
    passwordSalt: string
    balance: number
    createdAt: string
}

export interface Session {
    userId: string
}

export interface RegisterForm {
    fullName: string
    email: string
    password: string
    confirmPassword: string
}

export interface LoginForm {
    email: string
    password: string
}