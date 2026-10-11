// MOCK API — frontend-only stand-in for the backend. Everything here is DEMO DATA.
//
// Test scenarios (add to any URL, e.g. /emergency?mock=fail). Sticks for the browser tab:
//   ?mock=fail          -> create/cancel requests fail with a network error
//   ?mock=noambulance   -> case stays "waiting" forever (no ambulance available)
//   ?mock=off           -> back to normal
import {
  EMERGENCY_TYPES,
  type CaseStatus,
  type CreateEmergencyInput,
  type EmergencyCase,
  type Hospital,
  type LatLng,
} from '../types/contract'
import { ApiException } from './errors'
import type { Api } from './client'

const STORE_KEY = 'aidflow_mock_cases'
const COUNTER_KEY = 'aidflow_mock_counter'
const FLAG_KEY = 'aidflow_mock_flag'

// Case timeline in seconds since creation (demo speed).
const SCHEDULE: { at: number; status: CaseStatus }[] = [
  { at: 0, status: 'waiting' },
  { at: 3, status: 'offered' },
  { at: 6, status: 'assigned' },
  { at: 9, status: 'en_route' },
  { at: 30, status: 'reached_patient' },
  { at: 36, status: 'heading_to_hospital' },
  { at: 50, status: 'handed_over' },
  { at: 55, status: 'completed' },
]
const ASSIGNED_AT = 6
const REACHED_AT = 30
const DEMO_SPEED_KMH = 30 // assumed average speed for the demo ETA
const AMBULANCE_OFFSET_DEG = 0.018 // test unit starts ~2 km north of the patient

interface StoredCase {
  id: string
  type: EmergencyCase['type']
  severity: EmergencyCase['severity']
  reporterName: string
  reporterPhone: string
  description?: string
  pickup: EmergencyCase['pickup']
  createdAt: string
  hospital?: Hospital
  hospitalReason?: string
  baseEtaMinutes: number
  noAmbulance: boolean
  cancelledAt?: string
  cancelReason?: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function readFlag(): string {
  try {
    const q = new URLSearchParams(window.location.search).get('mock')
    if (q === 'off') sessionStorage.removeItem(FLAG_KEY)
    else if (q) sessionStorage.setItem(FLAG_KEY, q)
    return sessionStorage.getItem(FLAG_KEY) ?? ''
  } catch {
    return ''
  }
}

function loadStore(): Record<string, StoredCase> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}')
  } catch {
    return {}
  }
}
function saveStore(s: Record<string, StoredCase>) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s))
  } catch {
    /* storage unavailable — mock still works for this page load */
  }
}
function nextCaseId(): string {
  let n = 0
  try {
    n = Number(localStorage.getItem(COUNTER_KEY) ?? '0')
    localStorage.setItem(COUNTER_KEY, String(n + 1))
  } catch {
    n = Math.floor(Math.random() * 9000)
  }
  return `EMG-${new Date().getFullYear()}-${String(n + 1).padStart(4, '0')}`
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

let hospitalsCache: Hospital[] | null = null
async function loadHospitals(): Promise<Hospital[]> {
  if (hospitalsCache) return hospitalsCache
  try {
    const res = await fetch('/hospitals.json')
    if (!res.ok) throw new Error('hospitals.json missing')
    hospitalsCache = (await res.json()) as Hospital[]
  } catch {
    hospitalsCache = []
  }
  return hospitalsCache
}

function materialise(rec: StoredCase, now = Date.now()): EmergencyCase {
  const created = new Date(rec.createdAt).getTime()
  const elapsed = (now - created) / 1000
  let reached = SCHEDULE.filter((e) => e.at <= elapsed)
  if (rec.noAmbulance) reached = [SCHEDULE[0]]

  let history = reached.map((e) => ({
    status: e.status,
    at: new Date(created + e.at * 1000).toISOString(),
  }))

  if (rec.cancelledAt) {
    const cut = new Date(rec.cancelledAt).getTime()
    history = history.filter((h) => new Date(h.at).getTime() <= cut)
    history.push({ status: 'cancelled', at: rec.cancelledAt })
  }

  const status = history[history.length - 1].status
  const assigned = history.some((h) => h.status === 'assigned')

  let etaMinutes: number | undefined
  if (assigned && ['assigned', 'en_route'].includes(status)) {
    const progress = Math.min(1, Math.max(0, (elapsed - ASSIGNED_AT) / (REACHED_AT - ASSIGNED_AT)))
    etaMinutes = Math.max(1, Math.round(rec.baseEtaMinutes * (1 - progress)))
  }

  return {
    id: rec.id,
    type: rec.type,
    severity: rec.severity,
    reporterName: rec.reporterName,
    reporterPhone: rec.reporterPhone,
    description: rec.description,
    pickup: rec.pickup,
    status,
    ambulance: assigned
      ? {
          id: 'AMB-T01',
          label: 'TEST Ambulance 01',
          vehicleNumber: 'KA-00-TEST-01',
          driverFirstName: 'Test Driver',
          isTest: true,
        }
      : undefined,
    hospital: rec.hospital,
    hospitalReason: rec.hospitalReason,
    etaMinutes,
    createdAt: rec.createdAt,
    history,
    cancelReason: rec.cancelReason,
    isDemo: true,
  }
}

function validate(input: CreateEmergencyInput) {
  const type = EMERGENCY_TYPES.find((t) => t.id === input.type)
  if (!type) throw new ApiException('VALIDATION', 'Please choose an emergency type.')
  if (!input.reporterName || input.reporterName.trim().length < 2)
    throw new ApiException('VALIDATION', 'Please enter your full name.')
  if (!/^\d{10}$/.test((input.reporterPhone ?? '').replace(/\D/g, '')))
    throw new ApiException('VALIDATION', 'Enter any 10-digit demo phone number.')
  const { lat, lng } = input.pickup ?? ({} as LatLng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    throw new ApiException('VALIDATION', 'A valid pickup location is required.')
  return type
}

export const mockApi: Api = {
  async createEmergency(input) {
    await sleep(700)
    if (readFlag() === 'fail')
      throw new ApiException('NETWORK', 'Could not reach the server. Please try again.')
    const type = validate(input)

    const hospitals = await loadHospitals()
    let hospital: Hospital | undefined
    let best = Infinity
    for (const h of hospitals) {
      const d = distanceKm(input.pickup, h)
      if (d < best) {
        best = d
        hospital = h
      }
    }

    const id = nextCaseId()
    const rec: StoredCase = {
      id,
      type: type.id,
      severity: type.severity,
      reporterName: input.reporterName.trim(),
      reporterPhone: input.reporterPhone.replace(/\s|-/g, ''),
      description: input.description?.trim() || undefined,
      pickup: input.pickup,
      createdAt: new Date().toISOString(),
      hospital,
      hospitalReason: hospital
        ? `Nearest listed hospital by straight-line distance (${best.toFixed(1)} km). Capacity unknown.`
        : undefined,
      baseEtaMinutes: Math.max(
        1,
        Math.round((AMBULANCE_OFFSET_DEG * 111 * 60) / DEMO_SPEED_KMH),
      ),
      noAmbulance: readFlag() === 'noambulance',
    }
    const store = loadStore()
    store[id] = rec
    saveStore(store)
    return materialise(rec)
  },

  async getCase(id) {
    await sleep(150)
    const rec = loadStore()[id]
    if (!rec) throw new ApiException('NOT_FOUND', `Case ${id} was not found.`)
    return materialise(rec)
  },

  async cancelCase(id, reason) {
    await sleep(400)
    if (readFlag() === 'fail')
      throw new ApiException('NETWORK', 'Could not reach the server. Please try again.')
    const store = loadStore()
    const rec = store[id]
    if (!rec) throw new ApiException('NOT_FOUND', `Case ${id} was not found.`)
    const current = materialise(rec)
    if (['handed_over', 'completed', 'cancelled'].includes(current.status))
      throw new ApiException('INVALID_STATE', 'This case can no longer be cancelled.')
    rec.cancelledAt = new Date().toISOString()
    rec.cancelReason = reason.trim() || 'No reason given'
    saveStore(store)
    return materialise(rec)
  },

  async listHospitals() {
    return loadHospitals()
  },

  subscribeCase(id, onChange, onError) {
    let last = ''
    let stopped = false
    const tick = async () => {
      try {
        const c = await mockApi.getCase(id)
        const s = JSON.stringify(c)
        if (!stopped && s !== last) {
          last = s
          onChange(c)
        }
      } catch (e) {
        if (!stopped) onError?.(e as Error)
      }
    }
    void tick()
    const timer = setInterval(tick, 1000)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  },
}
