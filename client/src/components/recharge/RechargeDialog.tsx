import { useEffect, useRef, useState, type ChangeEvent, type SubmitEvent, type SyntheticEvent } from 'react'
import { QUICK_AMOUNTS } from '../../constants/snailpay'
import { useAuth } from '../../hooks/useAuth'
import { rechargeBalance } from '../../services/rechargeService'
import type { ChargeResponse, RechargeForm } from '../../types/snailpay'
import { formatRechargeField } from '../../utils/cardFormat'
import { formatCurrency } from '../../utils/format'
import { hasErrors, validateRecharge, type FieldErrors } from '../../utils/validations'
import { FormField } from '../FormField'
import { RechargeReceipt } from './RechargeReceipt'

interface RechargeDialogProps {
    onClose: () => void
    onSettled: () => void
}

export function RechargeDialog({ onClose, onSettled }: RechargeDialogProps) {
    const { user, updateUser } = useAuth()
    const dialogRef = useRef<HTMLDialogElement>(null)

    const [form, setForm] = useState<RechargeForm>(() => ({
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        cardholderName: user?.fullName ?? '',
        amount: '',
    }))
    const [wasSubmitted, setWasSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [approvedCharge, setApprovedCharge] = useState<ChargeResponse | null>(null)

    useEffect(() => {
        dialogRef.current?.showModal()
        dialogRef.current?.querySelector('input')?.focus()
    }, [])

    const errors: FieldErrors<RechargeForm> = wasSubmitted ? validateRecharge(form) : {}
    const amount = Number(form.amount)

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const field = event.target.name as keyof RechargeForm
        const value = formatRechargeField(field, event.target.value)
        setForm((current) => ({ ...current, [field]: value }))
    }

    function selectAmount(quickAmount: number) {
        setForm((current) => ({ ...current, amount: String(quickAmount) }))
    }

    function close() {
        dialogRef.current?.close()
    }

    function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
        if (isSubmitting) event.preventDefault()
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!user) return

        setWasSubmitted(true)
        setSubmitError(null)
        if (hasErrors(validateRecharge(form))) return

        setIsSubmitting(true)
        try {
            const result = await rechargeBalance(user, form)
            if (result.approved) {
                updateUser(result.user)
                setApprovedCharge(result.charge)
            } else {
                setSubmitError(result.message)
            }
        } catch {
            setSubmitError('Ocurrió un error inesperado. Revisa tu saldo antes de intentarlo de nuevo.')
        } finally {
            setIsSubmitting(false)
            onSettled()
        }
    }

    return (
        <dialog
            ref={dialogRef}
            className="recharge-dialog"
            aria-labelledby="recharge-title"
            onClose={onClose}
            onCancel={handleCancel}
        >
            <div className="d-flex align-items-center justify-content-between border-bottom px-4 py-3">
                <h2 id="recharge-title" className="h5 mb-0">
                    Recargar saldo
                </h2>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={close} disabled={isSubmitting} />
            </div>

            <div className="p-4">
                {approvedCharge ? (
                    <RechargeReceipt charge={approvedCharge} newBalance={user?.balance ?? 0} onDone={close} />
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        <p className="small text-body-secondary">
                            <i className="bi bi-shield-lock me-1" aria-hidden="true" />
                            Pago procesado por SnailPay. Usa solo datos de prueba.
                        </p>

                        <FormField
                            id="cardNumber"
                            name="cardNumber"
                            label="Número de tarjeta"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            placeholder="1234 1234 1234 1234"
                            value={form.cardNumber}
                            onChange={handleChange}
                            error={errors.cardNumber}
                            validated={wasSubmitted}
                        />

                        <div className="row g-3">
                            <div className="col-6">
                                <FormField
                                    id="expirationDate"
                                    name="expirationDate"
                                    label="Vencimiento"
                                    inputMode="numeric"
                                    autoComplete="cc-exp"
                                    placeholder="MM/AA"
                                    value={form.expirationDate}
                                    onChange={handleChange}
                                    error={errors.expirationDate}
                                    validated={wasSubmitted}
                                />
                            </div>
                            <div className="col-6">
                                <FormField
                                    id="cvv"
                                    name="cvv"
                                    label="CVV"
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                    placeholder="123"
                                    value={form.cvv}
                                    onChange={handleChange}
                                    error={errors.cvv}
                                    validated={wasSubmitted}
                                />
                            </div>
                        </div>

                        <FormField
                            id="cardholderName"
                            name="cardholderName"
                            label="Nombre en la tarjeta"
                            autoComplete="cc-name"
                            value={form.cardholderName}
                            onChange={handleChange}
                            error={errors.cardholderName}
                            validated={wasSubmitted}
                        />

                        <FormField
                            id="amount"
                            name="amount"
                            label="Monto a recargar (MXN)"
                            inputMode="decimal"
                            autoComplete="transaction-amount"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={handleChange}
                            error={errors.amount}
                            validated={wasSubmitted}
                        />

                        <div className="d-flex gap-2 mb-4" role="group" aria-label="Montos rápidos">
                            {QUICK_AMOUNTS.map((quickAmount) => {
                                const isSelected = amount === quickAmount
                                return (
                                    <button
                                        key={quickAmount}
                                        type="button"
                                        className={`btn btn-sm flex-fill ${isSelected ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                        aria-pressed={isSelected}
                                        onClick={() => selectAmount(quickAmount)}
                                    >
                                        {formatCurrency(quickAmount)}
                                    </button>
                                )
                            })}
                        </div>

                        {submitError && (
                            <div className="alert alert-danger py-2" role="alert">
                                {submitError}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                            {isSubmitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                            {isSubmitting ? 'Procesando pago…' : `Recargar${amount > 0 ? ` ${formatCurrency(amount)}` : ''}`}
                        </button>
                    </form>
                )}
            </div>
        </dialog>
    )
}