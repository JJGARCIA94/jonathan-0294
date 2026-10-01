import express, { Router, type NextFunction, type Request, type Response } from 'express'
import { buildChargeResponse, processCharge } from '../services/snailpayService.js'

export const snailpayRouter = Router()

snailpayRouter.use(express.json())

snailpayRouter.post('/charges', async (req: Request, res: Response) => {
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