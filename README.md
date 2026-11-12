# AidFlow — AI-Based Smart Ambulance Emergency Response and Hospital Recommendation System

> **ACADEMIC DEMONSTRATION NOTICE & SIMULATION DISCLAIMER**  
> AidFlow is a college academic demonstration prototype developed at the **Global Academy of Technology (Department of Computer Science & Engineering - AIML)**.  
> **This system is 100% simulated.** It does **NOT** place real phone calls, contact real emergency helplines (such as 108, 112, or 911), or dispatch real-world vehicles. The dummy helpline number **`1800-000-0000 (DEMO NUMBER)`**, driver telephony IVR, vehicle telemetry, and hospital ETA estimates are simulated in-software for academic evaluation and demonstration purposes. All ETA calculations are estimates based on topological routing and make no live-traffic claims.

---

## Current application flow (updated)

AidFlow now presents two main experiences:

- **User website** (port 5174, `/`): opens the supplied AI Call interface directly. The manual emergency form remains available at `/emergency/accessibility`.
- **Employee Control Room** (`/control-room`): staff review incoming reports, respond to live alerts, and use **Live Tracking** (`/live-tracking`) to select any report and view its details on an Esri satellite map.

When the AI Call is finalized, the backend stores the case, creates an `emergency_reported` alert, and emits `case:created` plus `alert:new` over Socket.IO. The Control Room subscribes to those events, refreshes the report feed, and shows a compact red notification on the left side of the screen. The notification includes a short chime when sound is enabled, emergency details, a dismiss action, and a View details action. It automatically closes after 9 seconds; a persistent sound control lets the operator enable or mute audio.

**Demo access warning:** the Control Room's read-only case feed and admin Socket.IO room are intentionally open without login for this classroom prototype, as requested. Anyone who can reach the backend can view submitted incident details. Do not expose this configuration to the public internet or use it for real emergency operations without restoring employee authentication and access controls.

## 1. System Overview & The 7-Step End-to-End Workflow

AidFlow bridges the critical communication and triage gap between emergency callers, dispatch operators, ambulance drivers, and receiving emergency departments through a connected 7-step lifecycle:

```
[1. REPORT]   ──▶ User submits the emergency form with GPS location
      │
[2. RECORD]   ──▶ Backend stores the report, creates an alert, and notifies the Control Room
      │
[3. DISPATCH] ──▶ Engine ranks nearest capable ambulance (BLS/ALS) and dispatches offer with 20s timeout
      │
[4. RESPOND]  ──▶ Driver accepts offer via Driver Cockpit button or Outbound IVR Phone Simulator (DTMF 1)
      │
[5. ROUTE]    ──▶ Smart routing engine calculates Dijkstra / A* route to optimal specialized hospital
      │
[6. TRACK]    ──▶ Real-time Socket.IO synchronization streams ambulance progress to Control Room & Patient
      │
[7. COMPLETE] ──▶ Journey milestones (En Route ➔ Scene ➔ Picked Up ➔ Hospital) conclude; ambulance freed
```

---

## 2. Core Architecture & Technologies

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet GIS.
- **Backend**: Node.js, Express, TypeScript, Socket.IO real-time engine, PostgreSQL (pg pool with atomic transaction helpers), Pino structured logger, Helmet security headers, Express Rate Limiter.
- **Routing & Hospital Recommendation**: Dijkstra / A* routing with multi-factor ranking over nearby records from the supplied hospital directory. Directory records are real-world reference data; bed/ICU occupancy is not live and is treated as unknown.
- **Emergency intake**: User-facing web form with GPS capture, shared REST API, and Socket.IO events to the Control Room.
- **Access mode**: The requested classroom Control Room is open without employee login. The backend retains protected operational endpoints; the public read-only case feed and admin socket are demo-only.

---

## 3. Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18+ LTS
- **PostgreSQL**: v13+ running locally on port `5432`

### One-Command Setup & Launch

1. **Clone the repository and install root dependencies**:
   ```bash
   npm install
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**:
   Create `backend/.env` (copy from `backend/.env.example`):
   ```env
   PORT=4000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aidflow
   DATABASE_URL_TEST=postgresql://postgres:postgres@localhost:5432/aidflow_test
   JWT_SECRET=super-secret-aidflow-key-min-16-chars-long
   SEED_DEMO_PASSWORD=ChangeMe123!
   DISPATCH_TIMEOUT_MS=20000
   DISPATCH_MAX_ROUNDS=4
   DISPATCH_CANDIDATE_RADIUS_KM=25
   TELEPHONY_PROVIDER=simulated
   ```

   In the project root, ensure `.env` has:
   ```env
   VITE_API_MODE=real
   VITE_API_URL=http://localhost:4000
   ```

4. **Initialize and Seed the Database**:
   ```bash
   # Inside /backend:
   npm run db:reset
   ```
   *This automatically applies migrations, seeds demo accounts and 12 simulated ambulances, then imports the supplied national hospital directory into the database. The dispatch recommender ranks nearby database hospitals around the emergency coordinates.*

5. **Start Both Frontend & Backend Simultaneously**:
   From the project root:
   ```bash
   npm run dev:all
   ```
   - **Control Room**: http://localhost:5173/control-room
- **User AI Call website**: http://localhost:5174/
   - **Backend API & Socket.IO**: http://localhost:4000
   - **Health Endpoint**: http://localhost:4000/health

---

## 4. Demo User Accounts

All demo accounts share the password set in `SEED_DEMO_PASSWORD` (default: **`ChangeMe123!`**). The `/login` page provides **one-click instant login buttons** for every role.

| Role | Email | Permissions & Accessible Dashboards |
|---|---|---|
| **Admin / Operator** | `admin@aidflow.demo` | Full access: `/control-room`, `/call-center`, `/delivery-patrol`, `/alerts` |
| **Ambulance Driver** | `driver1@aidflow.demo` | `/driver` (Driver Cockpit, Journey Updates, Simulated Phone IVR) |
| **Hospital Staff** | `hospital@aidflow.demo` | `/hospital-desk` (Bed & ICU Capacity, Incoming Patient Arrival Queue) |
| **Patient / Reporter** | `patient@aidflow.demo` | `/emergency` (Web Emergency Reporting), `/track/:id` (Live Case Tracking) |

---

## 5. End-to-End Demo Walkthrough Guide

To present the full 7-step system during an evaluation or college presentation, open two or three browser windows side-by-side:

### Option A: Dummy Helpline & Driver IVR Call Flow (Recommended)

1. **Window 1 (Home & Call Centre)**:
   - Navigate to `http://localhost:5174`.
   - Notice the prominent emergency helpline banner: **`1800-000-0000 (DEMO NUMBER)`**.
   - Click **"Simulate Incoming Call"** (or open `/call-center` and login as `admin@aidflow.demo`).
   - Click **"Answer Call"** on the ringing dialog. The caller's name, phone, and coordinates will automatically populate the registration form.
   - Select emergency severity (e.g. `Critical - Cardiac / Trauma`) and click **"Register Emergency & Alert Control Room"**.

2. **Window 2 (Driver Cockpit)**:
   - Navigate to `http://localhost:5173/login` and click **"Demo: Ambulance Driver"** to enter `/driver`.
   - Within seconds of emergency registration, the dispatch engine selects `AMB-01` (or nearest unit).
   - The Driver Cockpit simultaneously displays:
     - An **Incoming Dispatch Offer Banner** with a live 20-second countdown timer.
     - An **Outbound IVR Simulated Phone Call** popping up with simulated voice synthesizer text.
   - Click **"1"** on the phone keypad (or press the green **"Accept Dispatch Offer"** button).
   - The offer is atomically accepted on the server; the state transitions to `ACCEPTED` and `DISPATCHED`.

3. **Window 3 (Control Room Command Center & Hospital Desk)**:
   - Open `http://localhost:5173/control-room` (logged in as Admin).
   - An audio chime sounds and the emergency appears instantly via real-time WebSocket sync.
   - The map displays the optimal hospital selected by the AI recommendation algorithm (e.g., *Manipal Hospital Indiranagar* based on cardiac specialty and available ICU beds).
   - In Window 2 (Driver), click through the journey milestones:
     - **"Mark Arrived at Scene"** (`ARRIVED_AT_SCENE`)
     - **"Patient Picked Up"** (`PATIENT_ON_BOARD`)
     - **"Transporting to Hospital"** (`TRANSPORTING`)
     - **"Arrived at Hospital"** (`AT_HOSPITAL`)
     - **"Complete Mission"** (`COMPLETED`)
   - Notice in Window 3 (Hospital Desk at `/hospital-desk`) that the incoming patient appears in the pre-arrival triage queue and is cleared when the mission is completed. The ambulance status resets to `available`.

---

## 6. Verification & Test Suite Results

AidFlow includes comprehensive TypeScript verification, automated integration test suites against an isolated PostgreSQL test database (`aidflow_test`), and algorithmic graph benchmark comparisons:

### 1. TypeScript Static Analysis
```bash
npm run typecheck
```
- Frontend (`tsc --noEmit`) and Backend (`tsc -p tsconfig.json --noEmit`): **Passed with 0 errors**.

### 2. Vitest Backend Integration Test Suite
```bash
npm test --prefix backend
```
- **8/8 test files passed (100%)**
- **52/52 tests passed**:
  - `dispatch.test.ts` (5 tests): Verified candidate radius ranking, 20-second timeout expiration, and **10 simultaneous concurrent accepts resulting in exactly one `200 OK` and nine `409 Conflict` responses**.
  - `routing.test.ts` (9 tests): Verified Dijkstra and A* pathfinding, connectivity, edge weights, and multi-criteria hospital ranking.
  - `emergencies.test.ts` (9 tests): Verified case creation, duplicate submission rejection (50m radius / 60s window), state machine transitions, and parallel unique ID generation.
  - `ambulances.test.ts` (5 tests): Verified availability toggling, sequence-based out-of-order GPS drop rules, and vehicle status isolation.
  - `telephony.test.ts` (4 tests): Verified inbound dummy call sessions, answer transitions, emergency creation from call, and driver outbound DTMF `1`/`2` responses.
  - `auth.test.ts` (9 tests): Verified registration, BCrypt login, JWT verification, and RBAC endpoint rejection.
  - `socket.test.ts` (4 tests): Verified WebSocket connection, room joining (`case:join`, `role:admin`), and broadcast reception.
  - `health.test.ts` (7 tests): Verified DB connectivity status and system uptime.

### 3. Dijkstra vs. A* Graph Benchmark
```bash
npm run routing:compare --prefix backend
```
- Evaluated all origin-destination pairs on the road network graph.
- Results: **Distance parity is 100% identical** across all routes, with **A\* expanding up to 55% fewer nodes** due to Euclidean/Haversine heuristic bounding.

---

## 7. Key Documentation Links

Detailed design documents are provided in the `/backend/docs/` and `/docs/` directories:

- [`backend/docs/API_CONTRACT.md`](file:///backend/docs/API_CONTRACT.md) — Comprehensive REST API endpoints, schemas, and error responses.
- [`backend/docs/EVENTS.md`](file:///backend/docs/EVENTS.md) — Socket.IO real-time event catalog and room subscription protocol.
- [`backend/docs/DATA_MODEL.md`](file:///backend/docs/DATA_MODEL.md) — PostgreSQL database schemas, constraints, and indexes.
- [`backend/docs/ROUTING.md`](file:///backend/docs/ROUTING.md) — Graph routing specifications, Dijkstra vs. A* analysis, and hospital recommendation scoring.
- [`backend/docs/TELEPHONY.md`](file:///backend/docs/TELEPHONY.md) — Simulated telephony state machine, call sessions, and IVR DTMF processing.
- [`backend/docs/DISPATCH.md`](file:///backend/docs/DISPATCH.md) — Dispatch engine timeout, candidate ranking, and atomic concurrency handling.
- [`docs/AUDIT.md`](file:///docs/AUDIT.md) — Repo audit and implementation status matrix.

---

## 8. License & Academic Attribution

Created for the Department of Computer Science & Engineering (AIML), Global Academy of Technology.  
Academic Prototype &bull; For Educational and Demonstration Use Only.

## Separate User and Control Room webpages

- **Control Room**: `http://localhost:5173/control-room` (or `http://localhost:5173/`)
- **User webpage**: `http://localhost:5174/` (emergency form at `/emergency`)
- Both frontends connect to the same backend at `http://localhost:4000`.
- The backend CORS allowlist must include both frontend origins (`localhost` and `127.0.0.1` on ports 5173 and 5174).

## AI user call + Control Room integration

- Public user AI-call page: `http://localhost:5174/` (also available at `/emergency`)
- Admin Control Room: `http://localhost:5173/control-room` (sign in with an admin account first)
- Both pages use the same REST API at `VITE_API_URL` and the authenticated Socket.IO `role:admin` room. The user call is simulated in-browser; no telephone network is contacted.
- Copy `.env.example` to `.env` and keep `VITE_API_MODE=real` so AI-call intake reaches the shared backend.
- Run backend migrations with `npm --prefix backend run db:migrate` after configuring `backend/.env`. Migration `003_ai_call_intake.sql` extends the existing call-session and alert schema without replacing the dispatch/telephony tables.
- Start the backend and frontend with `npm run dev:all`. The AI call flow creates the case and `emergency_reported` alert, emits `case:created` and transcript events to the admin room, and starts the existing dispatch engine.


## Separate User AI Call website and Control Room (updated)

- `http://localhost:5174/` opens the uploaded AI Call interface directly. `/emergency` is an alias for the same interface. The manual form remains at `/emergency/accessibility`.
- `http://localhost:5173/` redirects to `/control-room`; the Control Room is not rendered by the User app.
- Run `npm run dev` (or `npm run dev:all`) once from the project root to start the two separate frontends and the shared backend.
- Finalizing an AI Call creates the emergency in PostgreSQL and emits `case:created` and `alert:new` to the Control Room Socket.IO admin room. The `ControlRoomAlertToast` displays a compact red left-side notification with an optional alert chime and a View details action.
- The shared backend and database must be running for cross-browser real-time alerts. See `INTEGRATION_GUIDE.md` for setup and testing.


## Supplied hospital and ambulance datasets

- `public/hospital_directory.json` is imported into PostgreSQL during `npm run db:reset`; it is used by hospital recommendation and nearby map search.
- `public/hospitals_geojson.json` is the supplied `export.geojson`; hospital geometry/name records are used for control-room map pins. Pins are ranked around the current map center rather than showing the first arbitrary records.
- The additional `archive.zip` is a Roboflow ambulance-detection computer-vision dataset (1,000 images, YOLOv8 oriented bounding-box labels). It is suitable as a separate future ambulance-image detection model, **not** as ambulance availability, GPS, driver, dispatch or fleet records. Its `data.yaml` class label is `storbow`, so verify/correct the class metadata before training. It is not wired into dispatch because it cannot tell the system which ambulance is available.
- The 12 ambulance records are explicitly simulated demo units. They are not real fleet assets or live GPS feeds.
