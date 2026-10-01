import { describe, expect, it } from 'vitest'
import { AuthError, getCurrentUser, login, logout, register } from './authService'
import { getSession } from './sessionStore'
import { getUsers } from './userStore'

const newUser = {
    fullName: '  Ana   López ',
    email: ' ANA@Correo.com ',
    password: 'MiClave123',
}

describe('register', () => {
    it('crea la cuenta con saldo $0, sin guardar la contraseña, y deja la sesión iniciada', async () => {
        const user = await register(newUser)

        expect(user.fullName).toBe('Ana López')
        expect(user.email).toBe('ana@correo.com')
        expect(user.balance).toBe(0)
        expect(JSON.stringify(getUsers())).not.toContain('MiClave123')
        expect(getSession()).toEqual({ userId: user.id })
    })

    it('no permite registrar dos veces el mismo correo', async () => {
        await register(newUser)

        const secondAttempt = register({ ...newUser, email: 'ana@correo.com' })

        await expect(secondAttempt).rejects.toBeInstanceOf(AuthError)
        await expect(secondAttempt).rejects.toThrow('Ya existe una cuenta con este correo')
    })
})

describe('login', () => {
    it('permite volver a entrar con el correo y la contraseña del registro', async () => {
        const registered = await register(newUser)
        logout()

        const user = await login('ana@correo.com', 'MiClave123')

        expect(user.id).toBe(registered.id)
        expect(getSession()).toEqual({ userId: registered.id })
    })

    it('da el mismo error con contraseña incorrecta y con correo inexistente', async () => {
        await register(newUser)
        logout()

        await expect(login('ana@correo.com', 'OtraClave123')).rejects.toThrow('Correo o contraseña incorrectos')
        await expect(login('nadie@correo.com', 'MiClave123')).rejects.toThrow('Correo o contraseña incorrectos')
    })
})

describe('getCurrentUser', () => {
    it('recupera al usuario de la sesión guardada, como al recargar la página', async () => {
        const registered = await register(newUser)

        expect(getCurrentUser()?.id).toBe(registered.id)
    })

    it('cerrar sesión borra la sesión pero conserva la cuenta', async () => {
        await register(newUser)

        logout()

        expect(getCurrentUser()).toBeNull()
        expect(getUsers()).toHaveLength(1)
    })

    it('descarta una sesión que apunta a un usuario que ya no existe', () => {
        localStorage.setItem('snail:session', JSON.stringify({ userId: 'usuario-borrado' }))

        expect(getCurrentUser()).toBeNull()
        expect(getSession()).toBeNull()
    })
})