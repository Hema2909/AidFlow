import { Router } from 'express'
import { pool } from '../../db/pool'
import type { Hospital } from '../../types/contract'

export const hospitalsRouter = Router()

// Maps a DB row to the Hospital shape in contract.ts (camelCase, ISO timestamps).
function toHospital(r: Record<string, any>): Hospital {
  return {
    id: r.id,
    name: r.name,
    address: r.address ?? undefined,
    phone: r.phone ?? undefined,
    category: r.category ?? undefined,
    lat: r.lat,
    lng: r.lng,
    capacityStatus: r.capacity_status,
    beds: r.beds ?? undefined,
    icuBeds: r.icu_beds ?? undefined,
    lastUpdated: r.last_updated ? new Date(r.last_updated).toISOString() : undefined,
  }
}

// GET /hospitals: the first real endpoint; the frontend's listHospitals() already calls this path.
hospitalsRouter.get('/hospitals', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM hospitals WHERE is_operational = TRUE ORDER BY name')
    res.json(rows.map(toHospital))
  } catch (err) {
    next(err)
  }
})
