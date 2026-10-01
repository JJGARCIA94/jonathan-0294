import { MAX_AMOUNT } from '../config/snailpay.js'
import type { ChargeRequest, ChargeStatusDetail } from '../types/snailpay.js'

const CARD_NUMBER_PATTERN = /^\d{16}$/
const EXPIRATION_DATE_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/
const CVV_PATTERN = /^\d{3}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

export type ChargeValidation = { valid: true; request: ChargeRequest } | { valid: false; detail: ChargeStatusDetail }

export function validateChargeRequest(body: unknown): ChargeValidation {
    if (typeof body !== 'object' || body === null) return invalid('invalid_request')
    const data = body as Record<string, unknown>

    const cardNumber = typeof data.card_number === 'string' ? data.card_number.replace(/\s/g, '') : ''
    if (!CARD_NUMBER_PATTERN.test(cardNumber)) return invalid('invalid_card_number')

    const expirationDate = data.expiration_date
    if (typeof expirationDate !== 'string' || !EXPIRATION_DATE_PATTERN.test(expirationDate)) {
        return invalid('invalid_expiration_date')
    }

    const cvv = data.cvv
    if (typeof cvv !== 'string' || !CVV_PATTERN.test(cvv)) return invalid('invalid_cvv')

    const cardholderName = typeof data.cardholder_name === 'string' ? data.cardholder_name.trim() : ''
    if (!cardholderName) return invalid('invalid_cardholder_name')

    const amount = data.amount
    if (!isValidAmount(amount)) return invalid('invalid_amount')

    const payerId = data.payer_id
    const payerEmail = data.payer_email
    if (typeof payerId !== 'string' || !payerId.trim() || typeof payerEmail !== 'string' || !EMAIL_PATTERN.test(payerEmail)) {
        return invalid('invalid_payer')
    }

    return {
        valid: true,
        request: {
            card_number: cardNumber,
            expiration_date: expirationDate,
            cvv,
            cardholder_name: cardholderName,
            amount,
            payer_id: payerId,
            payer_email: payerEmail,
        },
    }
}

export function pickKnownFields(body: unknown): Partial<ChargeRequest> {
    if (typeof body !== 'object' || body === null) return {}
    const data = body as Record<string, unknown>

    return {
        card_number: typeof data.card_number === 'string' ? data.card_number : undefined,
        cvv: typeof data.cvv === 'string' ? data.cvv : undefined,
        amount: typeof data.amount === 'number' ? data.amount : undefined,
        payer_id: typeof data.payer_id === 'string' ? data.payer_id : undefined,
        payer_email: typeof data.payer_email === 'string' ? data.payer_email : undefined,
    }
}

function isValidAmount(value: unknown): value is number {
    return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value > 0 &&
        value <= MAX_AMOUNT &&
        AMOUNT_PATTERN.test(String(value))
    )
}

function invalid(detail: ChargeStatusDetail): ChargeValidation {
    return { valid: false, detail }
}