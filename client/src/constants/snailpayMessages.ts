import type { ChargeStatusDetail } from '../types/snailpay'

export const CHARGE_MESSAGES: Record<ChargeStatusDetail, string> = {
    accredited: 'Recarga aprobada.',
    invalid_request: 'No pudimos procesar la solicitud. Revisa los datos e inténtalo de nuevo.',
    invalid_card_number: 'El número de tarjeta no es válido.',
    invalid_expiration_date: 'La fecha de vencimiento no es válida.',
    invalid_cvv: 'El CVV no es válido.',
    invalid_cardholder_name: 'Escribe el nombre como aparece en la tarjeta.',
    invalid_amount: 'El monto no es válido.',
    invalid_payer: 'No pudimos identificar tu cuenta. Cierra sesión y vuelve a entrar.',
    bad_expiration_date: 'La fecha de vencimiento no coincide con la tarjeta.',
    bad_cvv: 'El CVV no coincide con la tarjeta. Revisa los 3 dígitos del reverso.',
    insufficient_funds: 'La tarjeta no tiene fondos suficientes. Prueba con otra tarjeta o con un monto menor.',
    card_declined: 'El banco rechazó la tarjeta. Prueba con otra tarjeta.',
    too_many_requests: 'Hiciste demasiados intentos seguidos. Espera un minuto e inténtalo de nuevo. No se hizo ningún cargo.',
    service_unavailable: 'SnailPay no está disponible en este momento. No se hizo ningún cargo; inténtalo más tarde.',
    processing_timeout: 'SnailPay no pudo procesar el pago a tiempo. No se hizo ningún cargo.',
    internal_error: 'Ocurrió un error en SnailPay. No se hizo ningún cargo.',
}

export const CONNECTION_MESSAGES = {
    timeout: 'SnailPay tardó demasiado en responder y cancelamos la operación. Tu saldo no cambió; inténtalo de nuevo.',
    network_error: 'No pudimos conectar con SnailPay. Revisa tu conexión e inténtalo de nuevo. Tu saldo no cambió.',
    invalid_response: 'Recibimos una respuesta inesperada de SnailPay. Tu saldo no cambió.',
} as const