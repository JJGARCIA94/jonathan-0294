import type { ChargeResponse } from '../../types/snailpay'
import { maskCardNumber } from '../../utils/cardFormat'
import { formatCurrency, formatDateTime } from '../../utils/format'

interface RechargeReceiptProps {
    charge: ChargeResponse
    newBalance: number
    onDone: () => void
}

export function RechargeReceipt({ charge, newBalance, onDone }: RechargeReceiptProps) {
    return (
        <div className="text-center" role="status">
            <i className="bi bi-check-circle-fill text-success display-5" aria-hidden="true" />
            <h3 className="h5 mt-2">Recarga aprobada</h3>
            <p className="text-body-secondary">Se agregaron {formatCurrency(charge.transaction_amount ?? 0)} a tu saldo.</p>

            <dl className="row text-start small border rounded py-2 mx-0 mb-4">
                <dt className="col-5 fw-normal text-body-secondary">Nuevo saldo</dt>
                <dd className="col-7 text-end fw-semibold">{formatCurrency(newBalance)}</dd>
                <dt className="col-5 fw-normal text-body-secondary">Tarjeta</dt>
                <dd className="col-7 text-end">{maskCardNumber(charge.card_number)}</dd>
                <dt className="col-5 fw-normal text-body-secondary">Referencia</dt>
                <dd className="col-7 text-end font-monospace">{charge.reference}</dd>
                <dt className="col-5 fw-normal text-body-secondary">Autorización</dt>
                <dd className="col-7 text-end font-monospace">{charge.authorization_code}</dd>
                <dt className="col-5 fw-normal text-body-secondary">Fecha</dt>
                <dd className="col-7 text-end mb-0">{formatDateTime(charge.date_created)}</dd>
            </dl>

            <button type="button" className="btn btn-primary w-100" onClick={onDone}>
                Listo
            </button>
        </div>
    )
}