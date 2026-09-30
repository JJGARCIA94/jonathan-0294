import type { LoginForm, RegisterForm } from '../types/auth'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

const NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)*$/u
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MIN = 3
const NAME_MAX = 80
const EMAIL_MAX = 254
const PASSWORD_MIN = 8
const PASSWORD_MAX = 64

export function normalizeFullName(fullName: string): string {
    return fullName.trim().replace(/\s+/g, ' ')
}

export function validateFullName(value: string): string | undefined {
    const fullName = normalizeFullName(value)

    if (!fullName) return 'Escribe tu nombre completo'
    if (fullName.length < NAME_MIN || fullName.length > NAME_MAX) {
        return `El nombre debe tener entre ${NAME_MIN} y ${NAME_MAX} caracteres`
    }
    if (!NAME_PATTERN.test(fullName)) return 'Usa solo letras, espacios, apóstrofos o guiones'
    return undefined
}

export function validateEmail(value: string): string | undefined {
    const email = value.trim()

    if (!email) return 'Escribe tu correo electrónico'
    if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
        return 'Escribe un correo válido, por ejemplo nombre@correo.com'
    }
    return undefined
}

export function validatePassword(password: string): string | undefined {
    if (!password) return 'Escribe una contraseña'
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
        return `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`
    }
    if (!/\p{Lu}/u.test(password) || !/\p{Ll}/u.test(password) || !/\d/.test(password)) {
        return 'Incluye al menos una mayúscula, una minúscula y un número'
    }
    return undefined
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | undefined {
    if (!confirmation) return 'Confirma tu contraseña'
    if (confirmation !== password) return 'Las contraseñas no coinciden'
    return undefined
}

export function validateRegister(form: RegisterForm): FieldErrors<RegisterForm> {
    return {
        fullName: validateFullName(form.fullName),
        email: validateEmail(form.email),
        password: validatePassword(form.password),
        confirmPassword: validatePasswordConfirmation(form.password, form.confirmPassword),
    }
}

export function validateLogin(form: LoginForm): FieldErrors<LoginForm> {
    return {
        email: validateEmail(form.email),
        password: form.password ? undefined : 'Escribe tu contraseña',
    }
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
    return Object.values(errors).some(Boolean)
}

export const PASSWORD_HINT = `De ${PASSWORD_MIN} a ${PASSWORD_MAX} caracteres, con al menos una mayúscula, una minúscula y un número`