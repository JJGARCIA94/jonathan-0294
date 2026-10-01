import type { ChargeResponse } from '../types/snailpay'
import { readJson, STORAGE_KEYS, writeJson } from './storage'

export function getCharges(): ChargeResponse[] {
    const stored = readJson(STORAGE_KEYS.charges)
    return Array.isArray(stored) ? (stored as ChargeResponse[]) : []
}

export function getChargesForUser(userId: string): ChargeResponse[] {
    return getCharges().filter((charge) => charge.payer_id === userId)
}

export function saveCharge(charge: ChargeResponse): void {
    writeJson(STORAGE_KEYS.charges, [charge, ...getCharges()])
}