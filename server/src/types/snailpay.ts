export type ChargeStatus = 'approved' | 'rejected' | 'error'

export type ChargeStatusDetail =
    | 'accredited'
    | 'invalid_request'
    | 'invalid_card_number'
    | 'invalid_expiration_date'
    | 'invalid_cvv'
    | 'invalid_cardholder_name'
    | 'invalid_amount'
    | 'invalid_payer'
    | 'bad_expiration_date'
    | 'bad_cvv'
    | 'insufficient_funds'
    | 'card_declined'
    | 'service_unavailable'
    | 'processing_timeout'
    | 'internal_error'

export interface ChargeRequest {
    card_number: string
    expiration_date: string
    cvv: string
    cardholder_name: string
    amount: number
    payer_id: string
    payer_email: string
}

export interface ChargeResponse {
    id: string
    status: ChargeStatus
    status_detail: ChargeStatusDetail
    transaction_amount: number | null
    date_created: string
    authorization_code: string | null
    reference: string
    payer_id: string | null
    payer_email: string | null
    card_number: string | null
    cvv: string | null
}