import express, { Router, type NextFunction, type Request, type Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import { CHARGE_RATE_LIMIT } from '../config/snailpay.js'
import { buildChargeResponse, processCharge } from '../services/snailpayService.js'
import { pickKnownFields } from '../validations/chargeValidation.js'

export const snailpayRouter = Router()

snailpayRouter.use(express.json())

const chargeRateLimiter = rateLimit({
    windowMs: CHARGE_RATE_LIMIT.windowMs,
    limit: CHARGE_RATE_LIMIT.max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json(buildChargeResponse(pickKnownFields(req.body), 'rejected', 'too_many_requests'))
    },
})

snailpayRouter.post('/charges', chargeRateLimiter, async (req: Request, res: Response) => {
    const { httpStatus, body } = await processCharge(req.body)
    res.status(httpStatus).json(body)
})

snailpayRouter.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError) {
        res.status(400).json(buildChargeResponse({}, 'rejected', 'invalid_request'))
        return
    }

    console.error('Error inesperado en SnailPay', error)
    res.status(500).json(buildChargeResponse({}, 'error', 'internal_error'))
})