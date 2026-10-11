import http from 'node:http'
import { app } from './app'
import { env } from './config/env'
import { pool } from './db/pool'
import { logger } from './utils/logger'

// Using http.createServer (not app.listen) so Socket.IO can attach to the same server later.
const server = http.createServer(app)

server.listen(env.PORT, async () => {
  logger.info(`AidFlow backend listening on http://localhost:${env.PORT}`)
  try {
    await pool.query('SELECT 1')
    logger.info('PostgreSQL connection OK')
  } catch (err) {
    logger.error({ err }, 'Cannot reach PostgreSQL. Check DATABASE_URL, then run "npm run db:reset".')
  }
})

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down...`)
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 5000).unref()
}
process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
