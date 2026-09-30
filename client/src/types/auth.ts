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