const currencyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function formatCurrency(amount: number): string {
    return currencyFormatter.format(amount)
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' })

export function formatDateTime(isoDate: string): string {
    return dateTimeFormatter.format(new Date(isoDate))
}