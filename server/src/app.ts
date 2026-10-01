import cors from 'cors'
import express, { type Express } from 'express'
import { healthRouter } from './routes/health.js'
import { snailpayRouter } from './routes/snailpay.js'


export function createApp(): Express {
  const app = express()

  app.disable('x-powered-by')

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))

  app.use('/api/health', healthRouter)
  app.use('/api/snailpay', snailpayRouter)

  return app
}