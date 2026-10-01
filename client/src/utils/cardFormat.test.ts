import { describe, expect, it } from 'vitest'
import { formatAmount, formatCardNumber, formatExpirationDate, maskCardNumber } from './cardFormat'

describe('formatCardNumber', () => {
    it('agrupa los dígitos de 4 en 4', () => {
        expect(formatCardNumber('1234123412341234')).toBe('1234 1234 1234 1234')
    })

    it('quita lo que no son dígitos y corta en 16', () => {
        expect(formatCardNumber('1234-abcd 1234 1234 1234 99')).toBe('1234 1234 1234 1234')
    })
})

describe('formatExpirationDate', () => {
    it('agrega la diagonal al escribir el tercer dígito', () => {
        expect(formatExpirationDate('12')).toBe('12')
        expect(formatExpirationDate('122')).toBe('12/2')
        expect(formatExpirationDate('1226')).toBe('12/26')
    })
})

describe('formatAmount', () => {
    it('deja solo números y un punto, con máximo 2 decimales', () => {
        expect(formatAmount('1a50.5.55')).toBe('150.55')
        expect(formatAmount('99.999')).toBe('99.99')
    })
})

describe('maskCardNumber', () => {
    it('muestra solo los últimos 4 dígitos', () => {
        expect(maskCardNumber('1234123412341234')).toBe('•••• 1234')
    })
})