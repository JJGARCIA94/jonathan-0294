import { CHARGE_MESSAGES, CONNECTION_MESSAGES } from '../constants/snailpayMessages'
import type { User } from '../types/auth'
import type { ChargeResponse, RechargeForm } from '../types/snailpay'
import { saveCharge } from './chargeHistory'
import { createCharge } from './snailpayClient'
import { saveUser } from './userStore'

export type RechargeResult = { approved: true; user: User; charge: ChargeResponse } | { approved: false; message: string }

export async function rechargeBalance(user: User, form: RechargeForm): Promise<RechargeResult> {
    const amount = Number(form.amount)

    const outcome = await createCharge({
        card_number: form.cardNumber.replace(/\s/g, ''),
        expiration_date: form.expirationDate,
        cvv: form.cvv,
        cardholder_name: form.cardholderName.trim(),
        amount,
        payer_id: user.id,
        payer_email: user.email,
    })

    if (outcome.kind !== 'response') {
        return { approved: false, message: CONNECTION_MESSAGES[outcome.kind] }
    }

    const { httpStatus, charge } = outcome

    saveCharge(charge)

    const isApproved = httpStatus === 201 && charge.status === 'approved' && charge.transaction_amount === amount

    if (!isApproved) {
        const message =
            charge.status === 'approved'
                ? CONNECTION_MESSAGES.invalid_response
                : (CHARGE_MESSAGES[charge.status_detail] ?? CONNECTION_MESSAGES.invalid_response)
        return { approved: false, message }
    }

    const updatedUser: User = { ...user, balance: addMoney(user.balance, amount) }
    saveUser(updatedUser)

    return { approved: true, user: updatedUser, charge }
}

function addMoney(a: number, b: number): number {
    return (Math.round(a * 100) + Math.round(b * 100)) / 100
}