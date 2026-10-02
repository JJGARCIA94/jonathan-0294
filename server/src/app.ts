import cors from 'cors'
import express, { type Express } from 'express'
import { join, resolve } from 'node:path'
import { healthRouter } from './routes/health.js'
import { snailpayRouter } from './routes/snailpay.js'

export function createApp(): Express {
  const app = express()

  app.disable('x-powered-by')

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))

  app.use('/api/health', healthRouter)
  app.use('/api/snailpay', snailpayRouter)

  const clientDistDir = process.env.CLIENT_DIST_DIR
  if (clientDistDir) {
    serveClient(app, resolve(clientDistDir))
  }

  return app
}

function serveClient(app: Express, distDir: string) {
  app.use(express.static(distDir))

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) {
      next()
      return
    }
    res.sendFile(join(distDir, 'index.html'))
  })
}