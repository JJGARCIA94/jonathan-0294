import { HISTORY_LIMIT } from '../../constants/snailpay'
import type { ChargeResponse, ChargeStatus } from '../../types/snailpay'
import { maskCardNumber } from '../../utils/cardFormat'
import { formatCurrency, formatDateTime } from '../../utils/format'

const STATUS_BADGES: Record<ChargeStatus, { label: string; className: string }> = {
    approved: { label: 'Aprobada', className: 'text-bg-success' },
    rejected: { label: 'Rechazada', className: 'text-bg-danger' },
    error: { label: 'Error', className: 'text-bg-warning' },
}

interface ChargeHistoryTableProps {
    charges: ChargeResponse[]
}

export function ChargeHistoryTable({ charges }: ChargeHistoryTableProps) {
    if (charges.length === 0) {
        return <p className="text-body-secondary mb-0">Todavía no has hecho recargas.</p>
    }

    return (
        <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
                <thead>
                    <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Monto</th>
                        <th scope="col">Tarjeta</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Referencia</th>
                    </tr>
                </thead>
                <tbody>
                    {charges.slice(0, HISTORY_LIMIT).map((charge) => {
                        const badge = STATUS_BADGES[charge.status]
                        return (
                            <tr key={charge.id}>
                                <td className="text-nowrap">{formatDateTime(charge.date_created)}</td>
                                <td>{charge.transaction_amount === null ? '—' : formatCurrency(charge.transaction_amount)}</td>
                                <td className="text-nowrap">{maskCardNumber(charge.card_number)}</td>
                                <td>
                                    <span className={`badge ${badge.className}`}>{badge.label}</span>
                                </td>
                                <td className="font-monospace small text-nowrap">{charge.reference}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}