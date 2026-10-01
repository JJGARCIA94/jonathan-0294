import { afterEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../types/auth'
import type { ChargeResponse, RechargeForm } from '../types/snailpay'
import { getChargesForUser } from './chargeHistory'
import { rechargeBalance } from './rechargeService'
import { findUserById, saveUser } from './userStore'

const user: User = {
    id: 'user-1',
    fullName: 'Ana López',
    email: 'ana@correo.com',
    passwordHash: 'hash',
    passwordSalt: 'salt',
    balance: 0,
    createdAt: '2026-10-01T12:00:00.000Z',
}

const form: RechargeForm = {
    cardNumber: '1234 1234 1234 1234',
    expirationDate: '12/26',
    cvv: '543',
    cardholderName: 'Ana López',
    amount: '150.5',
}

function buildCharge(overrides: Partial<ChargeResponse> = {}): ChargeResponse {
    return {
        id: 'ch_1',
        status: 'approved',
        status_detail: 'accredited',
        transaction_amount: 150.5,
        date_created: '2026-10-01T18:30:00.000Z',
        authorization_code: '123456',
        reference: 'SNP-20261001-ABCDEF12',
        payer_id: 'user-1',
        payer_email: 'ana@correo.com',
        card_number: '1234123412341234',
        cvv: '543',
        ...overrides,
    }
}

function mockFetch(body: string, httpStatus: number) {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(body, { status: httpStatus }))
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

function mockSnailPay(charge: ChargeResponse, httpStatus: number) {
    return mockFetch(JSON.stringify(charge), httpStatus)
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('rechargeBalance: cobro aprobado', () => {
    it('suma el monto al saldo, lo guarda y guarda la respuesta con la tarjeta y el CVV', async () => {
        saveUser(user)
        mockSnailPay(buildCharge(), 201)

        const result = await rechargeBalance(user, form)

        expect(result.approved).toBe(true)
        expect(findUserById('user-1')?.balance).toBe(150.5)

        const [savedCharge] = getChargesForUser('user-1')
        expect(savedCharge.card_number).toBe('1234123412341234')
        expect(savedCharge.cvv).toBe('543')
    })

    it('envía a SnailPay los datos con el formato del API', async () => {
        saveUser(user)
        const fetchMock = mockSnailPay(buildCharge(), 201)

        await rechargeBalance(user, form)

        expect(fetchMock).toHaveBeenCalledOnce()
        const [url, options] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/snailpay/charges')
        expect(JSON.parse(options.body)).toEqual({
            card_number: '1234123412341234',
            expiration_date: '12/26',
            cvv: '543',
            cardholder_name: 'Ana López',
            amount: 150.5,
            payer_id: 'user-1',
            payer_email: 'ana@correo.com',
        })
    })

    it('suma en centavos exactos: 0.10 + 0.20 da 0.30', async () => {
        const userWithBalance = { ...user, balance: 0.1 }
        saveUser(userWithBalance)
        mockSnailPay(buildCharge({ transaction_amount: 0.2 }), 201)

        await rechargeBalance(userWithBalance, { ...form, amount: '0.2' })

        expect(findUserById('user-1')?.balance).toBe(0.3)
    })
})

const rejectionCases: { name: string; httpStatus: number; charge: Partial<ChargeResponse>; message: string }[] = [
    {
        name: 'fondos insuficientes',
        httpStatus: 402,
        charge: { status: 'rejected', status_detail: 'insufficient_funds' },
        message: 'no tiene fondos suficientes',
    },
    {
        name: 'CVV incorrecto',
        httpStatus: 402,
        charge: { status: 'rejected', status_detail: 'bad_cvv' },
        message: 'El CVV no coincide',
    },
    {
        name: 'SnailPay caído',
        httpStatus: 503,
        charge: { status: 'error', status_detail: 'service_unavailable' },
        message: 'no está disponible',
    },
    {
        name: 'SnailPay no procesó a tiempo',
        httpStatus: 504,
        charge: { status: 'error', status_detail: 'processing_timeout' },
        message: 'no pudo procesar el pago a tiempo',
    },
]

describe('rechargeBalance: cuando SnailPay no aprueba', () => {
    it.each(rejectionCases)('$name: muestra el mensaje y no toca el saldo', async ({ httpStatus, charge, message }) => {
        saveUser(user)
        mockSnailPay(buildCharge({ ...charge, authorization_code: null }), httpStatus)

        const result = await rechargeBalance(user, form)

        expect(result).toEqual({ approved: false, message: expect.stringContaining(message) })
        expect(findUserById('user-1')?.balance).toBe(0)
        expect(getChargesForUser('user-1')).toHaveLength(1)
    })
})

describe('rechargeBalance: protección contra falsos cobros exitosos', () => {
    it('no suma si SnailPay dice "approved" pero con otro monto', async () => {
        saveUser(user)
        mockSnailPay(buildCharge({ transaction_amount: 999 }), 201)

        const result = await rechargeBalance(user, form)

        expect(result.approved).toBe(false)
        expect(findUserById('user-1')?.balance).toBe(0)
    })

    it('no suma si SnailPay dice "approved" pero con un código distinto de 201', async () => {
        saveUser(user)
        mockSnailPay(buildCharge(), 200)

        const result = await rechargeBalance(user, form)

        expect(result.approved).toBe(false)
        expect(findUserById('user-1')?.balance).toBe(0)
    })
})

describe('rechargeBalance: cuando no llega respuesta de SnailPay', () => {
    it('timeout: el navegador cancela la petición y no se guarda nada', async () => {
        saveUser(user)
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('signal timed out', 'TimeoutError')))

        const result = await rechargeBalance(user, form)

        expect(result).toEqual({ approved: false, message: expect.stringContaining('tardó demasiado') })
        expect(findUserById('user-1')?.balance).toBe(0)
        expect(getChargesForUser('user-1')).toHaveLength(0)
    })

    it('servidor apagado: mensaje de conexión', async () => {
        saveUser(user)
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

        const result = await rechargeBalance(user, form)

        expect(result).toEqual({ approved: false, message: expect.stringContaining('No pudimos conectar') })
    })

    it('el proxy responde 502 sin SnailPay detrás: también es un problema de conexión', async () => {
        saveUser(user)
        mockFetch('', 502)

        const result = await rechargeBalance(user, form)

        expect(result).toEqual({ approved: false, message: expect.stringContaining('No pudimos conectar') })
    })
})