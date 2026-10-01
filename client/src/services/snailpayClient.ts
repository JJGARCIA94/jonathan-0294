import { SNAILPAY_TIMEOUT_MS } from '../constants/snailpay'
import type { ChargeRequest, ChargeResponse } from '../types/snailpay'

const CHARGES_URL = '/api/snailpay/charges'

export type ChargeOutcome =
    | { kind: 'response'; httpStatus: number; charge: ChargeResponse }
    | { kind: 'timeout' }
    | { kind: 'network_error' }
    | { kind: 'invalid_response' }

export async function createCharge(request: ChargeRequest): Promise<ChargeOutcome> {
    try {
        const response = await fetch(CHARGES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
            signal: AbortSignal.timeout(SNAILPAY_TIMEOUT_MS),
        })

        const body: unknown = await response.json().catch(() => null)
        if (!isChargeResponse(body)) {
            return response.status >= 500 ? { kind: 'network_error' } : { kind: 'invalid_response' }
        }

        return { kind: 'response', httpStatus: response.status, charge: body }
    } catch (error) {
        if (error instanceof DOMException && error.name === 'TimeoutError') return { kind: 'timeout' }
        return { kind: 'network_error' }
    }
}

function isChargeResponse(value: unknown): value is ChargeResponse {
    if (typeof value !== 'object' || value === null) return false
    const data = value as Record<string, unknown>

    return (
        typeof data.id === 'string' &&
        typeof data.status_detail === 'string' &&
        ['approved', 'rejected', 'error'].includes(data.status as string)
    )
}