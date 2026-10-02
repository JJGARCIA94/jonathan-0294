import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { CHARGE_RATE_LIMIT } from '../src/config/snailpay.js'

const declinedCharge = {
    card_number: '4111111111111111',
    expiration_date: '12/26',
    cvv: '543',
    cardholder_name: 'Ana López',
    amount: 100,
    payer_id: 'user-1',
    payer_email: 'ana@correo.com',
}

describe('límite de intentos de cobro', () => {
    it('después del máximo de intentos responde 429 con el formato de SnailPay', async () => {
        const app = createApp()

        for (let attempt = 1; attempt <= CHARGE_RATE_LIMIT.max; attempt++) {
            const response = await request(app).post('/api/snailpay/charges').send(declinedCharge)
            expect(response.status, `intento ${attempt}`).toBe(402)
        }

        const blocked = await request(app).post('/api/snailpay/charges').send(declinedCharge)

        expect(blocked.status).toBe(429)
        expect(blocked.body).toMatchObject({
            status: 'rejected',
            status_detail: 'too_many_requests',
            authorization_code: null,
            payer_id: 'user-1',
        })
        expect(blocked.headers['retry-after']).toBeDefined()
    })
})