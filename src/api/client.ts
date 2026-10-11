// The ONLY file screens import data functions from.
// VITE_API_MODE=mock (default) -> demo data, no backend needed.
// VITE_API_MODE=real           -> calls Hema's Express API (routes below are PROPOSED; confirm with her).
import type { CreateEmergencyInput, EmergencyCase, Hospital } from '../types/contract'
import { ApiException } from './errors'
import { mockApi } from './mock'

export interface Api {
  createEmergency(input: CreateEmergencyInput): Promise<EmergencyCase>
  getCase(id: string): Promise<EmergencyCase>
  cancelCase(id: string, reason: string): Promise<EmergencyCase>
  listHospitals(): Promise<Hospital[]>
  /** Calls onChange whenever the case changes. Returns an unsubscribe function. */
  subscribeCase(
    id: string,
    onChange: (c: EmergencyCase) => void,
    onError?: (e: Error) => void,
  ): () => void
}

export const isMock = import.meta.env.VITE_API_MODE !== 'real'
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiException('NETWORK', 'Could not reach the server. Please try again.')
  }
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string } } | null)?.error
    throw new ApiException(err?.code ?? 'SERVER', err?.message ?? `Request failed (${res.status}).`)
  }
  return body as T
}

const realApi: Api = {
  createEmergency: (input) =>
    request<EmergencyCase>('/emergencies', { method: 'POST', body: JSON.stringify(input) }),
  getCase: (id) => request<EmergencyCase>(`/emergencies/${encodeURIComponent(id)}`),
  cancelCase: (id, reason) =>
    request<EmergencyCase>(`/emergencies/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  listHospitals: () => request<Hospital[]>('/hospitals'),
  // Polling for now; switch to Socket.IO once Hema publishes the event catalogue.
  subscribeCase(id, onChange, onError) {
    let last = ''
    let stopped = false
    const tick = async () => {
      try {
        const c = await realApi.getCase(id)
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
    const timer = setInterval(tick, 2000)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  },
}

export const api: Api = isMock ? mockApi : realApi
export { ApiException } from './errors'
