import { describe, expect, it } from 'vitest'
import {
    hasErrors,
    validateEmail,
    validateFullName,
    validateLogin,
    validatePassword,
    validateRecharge,
    validateRegister,
} from './validations'

describe('validateFullName', () => {
    it('acepta nombres con acentos, apóstrofos y guiones', () => {
        expect(validateFullName('María José Pérez-López')).toBeUndefined()
        expect(validateFullName("O'Connor")).toBeUndefined()
    })

    it('rechaza nombres vacíos, muy cortos o con números', () => {
        expect(validateFullName('   ')).toBe('Escribe tu nombre completo')
        expect(validateFullName('Jo')).toBe('El nombre debe tener entre 3 y 80 caracteres')
        expect(validateFullName('Ana 123')).toBe('Usa solo letras, espacios, apóstrofos o guiones')
    })
})

describe('validateEmail', () => {
    it('acepta un correo válido aunque tenga espacios alrededor', () => {
        expect(validateEmail('  ana@correo.com ')).toBeUndefined()
    })

    it('rechaza un correo sin dominio completo', () => {
        expect(validateEmail('ana@correo')).toBe('Escribe un correo válido, por ejemplo nombre@correo.com')
    })
})

describe('validatePassword', () => {
    it('acepta una contraseña con mayúscula, minúscula y número', () => {
        expect(validatePassword('MiClave123')).toBeUndefined()
    })

    it('rechaza contraseñas cortas', () => {
        expect(validatePassword('Ab1')).toBe('La contraseña debe tener entre 8 y 64 caracteres')
    })

    it('rechaza contraseñas sin mayúscula, sin minúscula o sin número', () => {
        const message = 'Incluye al menos una mayúscula, una minúscula y un número'

        expect(validatePassword('miclave123')).toBe(message)
        expect(validatePassword('MICLAVE123')).toBe(message)
        expect(validatePassword('MiClaveSinNumero')).toBe(message)
    })
})

describe('validateRegister', () => {
    const validForm = {
        fullName: 'Ana López',
        email: 'ana@correo.com',
        password: 'MiClave123',
        confirmPassword: 'MiClave123',
    }

    it('no marca errores cuando todos los datos son válidos', () => {
        const errors = validateRegister(validForm)

        expect(hasErrors(errors)).toBe(false)
    })

    it('marca error si la confirmación no coincide con la contraseña', () => {
        const errors = validateRegister({ ...validForm, confirmPassword: 'OtraClave123' })

        expect(errors.confirmPassword).toBe('Las contraseñas no coinciden')
        expect(hasErrors(errors)).toBe(true)
    })
})

describe('validateLogin', () => {
    it('solo pide que la contraseña no esté vacía, sin aplicar las reglas del registro', () => {
        expect(validateLogin({ email: 'ana@correo.com', password: 'abc' }).password).toBeUndefined()
        expect(validateLogin({ email: 'ana@correo.com', password: '' }).password).toBe('Escribe tu contraseña')
    })
})

describe('validateRecharge', () => {
    const validForm = {
        cardNumber: '1234 1234 1234 1234',
        expirationDate: '12/26',
        cvv: '543',
        cardholderName: 'Ana López',
        amount: '150.50',
    }

    it('acepta los datos de la tarjeta de prueba', () => {
        expect(hasErrors(validateRecharge(validForm))).toBe(false)
    })

    it('rechaza un monto en cero o mayor al máximo permitido', () => {
        expect(validateRecharge({ ...validForm, amount: '0' }).amount).toBe('El monto debe ser mayor a $0')
        expect(validateRecharge({ ...validForm, amount: '50000.01' }).amount).toBe(
            'El monto máximo por recarga es $50,000.00',
        )
    })

    it('rechaza una fecha con un mes que no existe', () => {
        expect(validateRecharge({ ...validForm, expirationDate: '13/26' }).expirationDate).toBe(
            'Usa el formato MM/AA, por ejemplo 12/26',
        )
    })
})