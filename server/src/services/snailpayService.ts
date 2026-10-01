import { randomInt, randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import {
    APPROVED_CARD,
    INSUFFICIENT_FUNDS_CARD,
    SYSTEM_ERROR_CARD,
    TIMEOUT_CARD,
    TIMEOUT_DELAY_MS,
} from '../config/snailpay.js'
import type { ChargeRequest, ChargeResponse, ChargeStatus, ChargeStatusDetail } from '../types/snailpay.js'
import { pickKnownFields, validateChargeRequest } from '../validations/chargeValidation.js'

export interface ChargeResult {
    httpStatus: number
    body: ChargeResponse
}

export async function processCharge(body: unknown): Promise<ChargeResult> {
    const validation = validateChargeRequest(body)
    if (!validation.valid) {
        return { httpStatus: 400, body: buildChargeResponse(pickKnownFields(body), 'rejected', validation.detail) }
    }

    const request = validation.request

    if (request.card_number === SYSTEM_ERROR_CARD) {
        return result(503, request, 'error', 'service_unavailable')
    }
    if (request.card_number === TIMEOUT_CARD) {
        await delay(TIMEOUT_DELAY_MS)
        return result(504, request, 'error', 'processing_timeout')
    }

    if (request.card_number === INSUFFICIENT_FUNDS_CARD) {
        return result(402, request, 'rejected', 'insufficient_funds')
    }
    if (request.card_number !== APPROVED_CARD.number) {
        return result(402, request, 'rejected', 'card_declined')
    }
    if (request.expiration_date !== APPROVED_CARD.expirationDate) {
        return result(402, request, 'rejected', 'bad_expiration_date')
    }
    if (request.cvv !== APPROVED_CARD.cvv) {
        return result(402, request, 'rejected', 'bad_cvv')
    }

    return result(201, request, 'approved', 'accredited')
}

export function buildChargeResponse(
    source: Partial<ChargeRequest>,
    status: ChargeStatus,
    detail: ChargeStatusDetail,
): ChargeResponse {
    return {
        id: `ch_${randomUUID()}`,
        status,
        status_detail: detail,
        transaction_amount: source.amount ?? null,
        date_created: new Date().toISOString(),
        authorization_code: status === 'approved' ? String(randomInt(0, 1_000_000)).padStart(6, '0') : null,
        reference: buildReference(),
        payer_id: source.payer_id ?? null,
        payer_email: source.payer_email ?? null,
        card_number: source.card_number ?? null,
        cvv: source.cvv ?? null,
    }
}

function result(
    httpStatus: number,
    request: ChargeRequest,
    status: ChargeStatus,
    detail: ChargeStatusDetail,
): ChargeResult {
    return { httpStatus, body: buildChargeResponse(request, status, detail) }
}

function buildReference(): string {
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
    const suffix = randomUUID().slice(0, 8).toUpperCase()
    return `SNP-${date}-${suffix}`
}