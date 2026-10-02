import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { startSession } from '../services/sessionStore'
import { saveUser } from '../services/userStore'
import type { ChargeResponse } from '../types/snailpay'

const PAGE_LOAD = { timeout: 15_000 }

function openDashboard() {
    saveUser({
        id: 'user-1',
        fullName: 'Ana López',
        email: 'ana@correo.com',
        passwordHash: 'hash',
        passwordSalt: 'salt',
        balance: 0,
        createdAt: '2026-10-01T12:00:00.000Z',
    })
    startSession('user-1')
    window.history.pushState({}, '', '/dashboard')
    render(<App />)
}

function mockSnailPay(charge: Partial<ChargeResponse>, httpStatus: number) {
    const body: ChargeResponse = {
        id: 'ch_1',
        status: 'approved',
        status_detail: 'accredited',
        transaction_amount: 200,
        date_created: '2026-10-01T18:30:00.000Z',
        authorization_code: '123456',
        reference: 'SNP-20261001-ABCDEF12',
        payer_id: 'user-1',
        payer_email: 'ana@correo.com',
        card_number: '1234123412341234',
        cvv: '543',
        ...charge,
    }
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response(JSON.stringify(body), { status: httpStatus })))
}

async function fillCard(user: ReturnType<typeof userEvent.setup>, dialog: ReturnType<typeof within>, cardNumber: string) {
    await user.type(dialog.getByLabelText('Número de tarjeta'), cardNumber)
    await user.type(dialog.getByLabelText('Vencimiento'), '1226')
    await user.type(dialog.getByLabelText('CVV'), '543')
}

beforeAll(async () => {
    await import('./DashboardPage')
}, 60_000)

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('recarga de saldo', () => {
    it('formatea los datos, aprueba la recarga y actualiza el saldo y el historial', async () => {
        const user = userEvent.setup()
        openDashboard()
        expect(await screen.findByText('Todavía no has hecho recargas.', {}, PAGE_LOAD)).toBeInTheDocument()

        await user.click(await screen.findByRole('button', { name: /Recargar saldo/ }, PAGE_LOAD))
        const dialog = within(screen.getByRole('dialog', { name: 'Recargar saldo' }))

        await fillCard(user, dialog, '1234123412341234')
        await user.click(dialog.getByRole('button', { name: '$200.00' }))

        expect(dialog.getByLabelText('Número de tarjeta')).toHaveValue('1234 1234 1234 1234')
        expect(dialog.getByLabelText('Vencimiento')).toHaveValue('12/26')
        expect(dialog.getByLabelText('Monto a recargar (MXN)')).toHaveValue('200')

        mockSnailPay({}, 201)
        await user.click(dialog.getByRole('button', { name: 'Recargar $200.00' }))

        expect(await dialog.findByText('Recarga aprobada')).toBeInTheDocument()

        const balanceCard = within(screen.getByText('Saldo actual').closest('section')!)
        expect(balanceCard.getByText('$200.00')).toBeInTheDocument()
        expect(screen.getByText('Aprobada')).toBeInTheDocument()

        await user.click(dialog.getByRole('button', { name: 'Listo' }))
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('si SnailPay rechaza la tarjeta, muestra el motivo y el saldo no cambia', async () => {
        const user = userEvent.setup()
        openDashboard()

        await user.click(await screen.findByRole('button', { name: /Recargar saldo/ }, PAGE_LOAD))
        const dialog = within(screen.getByRole('dialog', { name: 'Recargar saldo' }))

        await fillCard(user, dialog, '4000000000000002')
        await user.type(dialog.getByLabelText('Monto a recargar (MXN)'), '100')

        mockSnailPay({ status: 'rejected', status_detail: 'insufficient_funds', authorization_code: null, transaction_amount: 100 }, 402)
        await user.click(dialog.getByRole('button', { name: 'Recargar $100.00' }))

        expect(await dialog.findByRole('alert')).toHaveTextContent('no tiene fondos suficientes')

        const balanceCard = within(screen.getByText('Saldo actual').closest('section')!)
        expect(balanceCard.getByText('$0.00')).toBeInTheDocument()
        expect(screen.getByText('Rechazada')).toBeInTheDocument()
    })
})