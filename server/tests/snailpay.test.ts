import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'

vi.mock('../src/config/snailpay.js', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../src/config/snailpay.js')>()),
    TIMEOUT_DELAY_MS: 50,
    CHARGE_RATE_LIMIT: { windowMs: 60_000, max: 1000 },
}))

const app = createApp()

const RESPONSE_FIELDS = [
    'id',
    'status',
    'status_detail',
    'transaction_amount',
    'date_created',
    'authorization_code',
    'reference',
    'payer_id',
    'payer_email',
    'card_number',
    'cvv',
]

const validCharge = {
    card_number: '1234123412341234',
    expiration_date: '12/26',
    cvv: '543',
    cardholder_name: 'Ana López',
    amount: 150.5,
    payer_id: 'user-1',
    payer_email: 'ana@correo.com',
}

function postCharge(body: object) {
    return request(app).post('/api/snailpay/charges').send(body)
}

describe('POST /api/snailpay/charges: cobro exitoso', () => {
    it('aprueba la tarjeta de prueba con todos los campos de la respuesta', async () => {
        const response = await postCharge(validCharge)

        expect(response.status).toBe(201)
        expect(Object.keys(response.body).sort()).toEqual([...RESPONSE_FIELDS].sort())
        expect(response.body).toMatchObject({
            status: 'approved',
            status_detail: 'accredited',
            transaction_amount: 150.5,
            payer_id: 'user-1',
            payer_email: 'ana@correo.com',
            card_number: '1234123412341234',
            cvv: '543',
        })
        expect(response.body.authorization_code).toMatch(/^\d{6}$/)
        expect(response.body.reference).toMatch(/^SNP-\d{8}-[0-9A-F]{8}$/)
    })

    it('acepta el número de tarjeta con espacios', async () => {
        const response = await postCharge({ ...validCharge, card_number: '1234 1234 1234 1234' })

        expect(response.status).toBe(201)
    })
})

describe('POST /api/snailpay/charges: rechazos y errores', () => {
    it.each([
        { name: 'CVV incorrecto', change: { cvv: '544' }, httpStatus: 402, detail: 'bad_cvv' },
        { name: 'vencimiento incorrecto', change: { expiration_date: '11/26' }, httpStatus: 402, detail: 'bad_expiration_date' },
        { name: 'fondos insuficientes', change: { card_number: '4000000000000002' }, httpStatus: 402, detail: 'insufficient_funds' },
        { name: 'tarjeta desconocida', change: { card_number: '4111111111111111' }, httpStatus: 402, detail: 'card_declined' },
        { name: 'tarjeta incompleta', change: { card_number: '1234' }, httpStatus: 400, detail: 'invalid_card_number' },
        { name: 'mes inexistente', change: { expiration_date: '13/26' }, httpStatus: 400, detail: 'invalid_expiration_date' },
        { name: 'CVV de 2 dígitos', change: { cvv: '54' }, httpStatus: 400, detail: 'invalid_cvv' },
        { name: 'nombre vacío', change: { cardholder_name: '  ' }, httpStatus: 400, detail: 'invalid_cardholder_name' },
        { name: 'monto en cero', change: { amount: 0 }, httpStatus: 400, detail: 'invalid_amount' },
        { name: 'monto como texto', change: { amount: '100' }, httpStatus: 400, detail: 'invalid_amount' },
        { name: 'monto con 3 decimales', change: { amount: 10.555 }, httpStatus: 400, detail: 'invalid_amount' },
        { name: 'correo inválido', change: { payer_email: 'no-es-correo' }, httpStatus: 400, detail: 'invalid_payer' },
        { name: 'SnailPay caído', change: { card_number: '5000000000000009' }, httpStatus: 503, detail: 'service_unavailable' },
        { name: 'SnailPay tarda demasiado', change: { card_number: '5000000000000017' }, httpStatus: 504, detail: 'processing_timeout' },
    ])('$name → $httpStatus $detail, sin autorización', async ({ change, httpStatus, detail }) => {
        const response = await postCharge({ ...validCharge, ...change })

        expect(response.status).toBe(httpStatus)
        expect(response.body.status).not.toBe('approved')
        expect(response.body.status_detail).toBe(detail)
        expect(response.body.authorization_code).toBeNull()
        expect(Object.keys(response.body).sort()).toEqual([...RESPONSE_FIELDS].sort())
    })

    it('un JSON mal formado también responde con el formato de SnailPay', async () => {
        const response = await request(app)
            .post('/api/snailpay/charges')
            .set('Content-Type', 'application/json')
            .send('{"card_number": ')

        expect(response.status).toBe(400)
        expect(response.body.status_detail).toBe('invalid_request')
        expect(Object.keys(response.body).sort()).toEqual([...RESPONSE_FIELDS].sort())
    })
})

describe('seguridad', () => {
    it('no anuncia que el servidor usa Express y solo permite al frontend configurado', async () => {
        const response = await postCharge(validCharge).set('Origin', 'http://localhost:5173')

        expect(response.headers['x-powered-by']).toBeUndefined()
        expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
        expect(response.headers['x-content-type-options']).toBe('nosniff')
        expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
        expect(response.headers['content-security-policy']).toContain("default-src 'self'")
    })
})