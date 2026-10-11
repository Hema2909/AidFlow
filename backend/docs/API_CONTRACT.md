# AidFlow API Contract (DRAFT v0.1, to agree with Chiranthan, Harshith and Bindu)

Base URL (local): `http://localhost:4000`. JSON only. Coordinates are decimal degrees (`lat`, `lng`). Timestamps are ISO 8601 UTC.
The shapes below match `src/types/contract.ts` in the frontend. Change names only after the whole team agrees.

## Error format (all failures)

```json
{ "error": { "code": "VALIDATION", "message": "Some fields are invalid.", "details": [{ "field": "reporterPhone", "message": "..." }] } }
```
Codes: `VALIDATION` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL` (500).

## Status model (case)

`waiting` -> `offered` -> `assigned` -> `en_route` -> `reached_patient` -> `heading_to_hospital` -> `handed_over` -> `completed`
and `cancelled` from any active state. Dispatch attempt outcome: `pending`, `accepted`, `rejected`, `timed_out`.
The 20 s timeout is enforced by the server (`DISPATCH_TIMEOUT_MS`); the countdown in the UI is display only.

## Routes

| Method & path | Who | Purpose | State |
|---|---|---|---|
| `GET /health` | public | Service + database check | Implemented |
| `GET /hospitals` | public | Operational hospitals (`Hospital[]`) | Implemented |
| `POST /auth/register`, `POST /auth/login` | public | Returns a JWT + user | Planned |
| `POST /emergencies` | patient | Create case, returns `EmergencyCase` with server `id` (e.g. `EMG-2026-0001`) | Planned |
| `GET /emergencies/:id` | owner / admin | Case + `history[]` | Planned |
| `GET /emergencies` | admin | List/filter cases | Planned |
| `POST /emergencies/:id/cancel` | owner / admin | Body `{ "reason": "..." }` | Planned |
| `POST /emergencies/:id/assign` | admin | Manual assignment `{ "ambulanceId": "..." }` | Planned |
| `POST /emergencies/:id/complete` | admin | Mark completed | Planned |
| `GET /driver/requests` | driver | Current offer(s) | Planned |
| `POST /dispatch/:attemptId/accept` and `/reject` | driver | Atomic; `409` if too late | Planned |
| `PATCH /ambulances/:id/availability` | driver | `{ "status": "available" or "offline" }` | Planned |
| `PATCH /ambulances/:id/location` | driver | Bindu's payload below | Planned |
| `GET/PATCH /hospitals/:id/status` | hospital | Capacity and operational status | Planned |
| `GET /alerts`, `PATCH /alerts/:id/acknowledge` | admin / hospital | Alerts | Planned |

### Location payload (agree with Bindu)

```json
{ "ambulanceId": "uuid", "lat": 12.9716, "lng": 77.5946, "timestamp": "2026-10-11T08:42:21.000Z", "heading": 90, "speed": 35 }
```
`heading` and `speed` optional. The server ignores any update older than the stored `last_location_at`.

## Socket.IO events (draft, server to client)

| Event | Room | Payload |
|---|---|---|
| `dispatch:offered` | `driver:<id>` | `DispatchAttempt` + case summary |
| `dispatch:accepted`, `dispatch:rejected`, `dispatch:timeout` | `role:admin`, `case:<id>` | `DispatchAttempt` |
| `dispatch:reassigned` | `role:admin`, `case:<id>` | `{ caseId, fromAmbulanceId, toAmbulanceId }` |
| `case:status` | `case:<id>`, `role:admin` | `EmergencyCase` |
| `alert:new` | `role:admin` (+ hospital) | `AlertItem` |
| `ambulance:location` | `case:<id>`, `role:admin` | Location payload |

Events are sent only after the database transaction commits. On reconnect the client re-joins its rooms and refetches current state.
