import cors from 'cors'
import express, { type Express } from 'express'

import { healthRouter } from './routes/health.js'

// La app se construye aparte de index.ts para poder probarla con supertest sin abrir un puerto.
export function createApp(): Express {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.use('/api/health', healthRouter)

  return app
}
