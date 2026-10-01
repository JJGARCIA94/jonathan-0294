import type { RechargeForm } from '../types/snailpay'

export function onlyDigits(value: string, maxLength: number): string {
    return value.replace(/\D/g, '').slice(0, maxLength)
}

export function formatCardNumber(value: string): string {
    return onlyDigits(value, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatExpirationDate(value: string): string {
    const digits = onlyDigits(value, 4)
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function formatAmount(value: string): string {
    const [integerPart, ...decimalParts] = value.replace(/[^\d.]/g, '').split('.')
    if (decimalParts.length === 0) return integerPart
    return `${integerPart}.${decimalParts.join('').slice(0, 2)}`
}

export function formatRechargeField(field: keyof RechargeForm, value: string): string {
    switch (field) {
        case 'cardNumber':
            return formatCardNumber(value)
        case 'expirationDate':
            return formatExpirationDate(value)
        case 'cvv':
            return onlyDigits(value, 3)
        case 'amount':
            return formatAmount(value)
        default:
            return value
    }
}

export function maskCardNumber(cardNumber: string | null): string {
    return cardNumber ? `•••• ${cardNumber.slice(-4)}` : '—'
}