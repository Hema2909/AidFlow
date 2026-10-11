import cors from 'cors'
import express from 'express'
import { corsOrigins } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { healthRouter } from './modules/health/health.routes'
import { hospitalsRouter } from './modules/hospitals/hospitals.routes'
import { logger } from './utils/logger'

export const app = express()

app.use(cors({ origin: corsOrigins }))
app.use(express.json({ limit: '100kb' }))
app.use((req, _res, next) => {
  logger.debug({ method: req.method, path: req.path }, 'request')
  next()
})

// Routes live at the root (no /api prefix) to match the frontend client: src/api/client.ts
app.use(healthRouter)
app.use(hospitalsRouter)

app.use(notFoundHandler)
app.use(errorHandler)
