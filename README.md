# AidFlow — Emergency Response Prototype

## Added operations workspace

- `/control-room` — summary cards for New, Processing and Completed reports; tabs; editable status dropdowns; report creation shortcut; fleet readiness and hospital links.
- `/delivery-patrol` — clickable ambulance-unit status management for demo fleet records.
- `/hospitals` — searchable hospital directory from the supplied `hospital_directory.csv`, state filter, optional browser geolocation sorting, facility detail panel, Google Maps directions, total bed count when present, specialties, contact and facility information.
- `/live-tracking` — tracking workspace placeholder that clearly explains which backend/GPS integration is required; it does not pretend demo markers are real vehicle positions.
- `/alerts` — reviewable operations notices.

## Start locally

1. Install Node.js (LTS).
2. Open a terminal in this project folder.
3. Run `npm install`.
4. Run `npm run dev` and open the local URL shown by Vite.

## Hospital data notes

`public/hospital_directory.json` was generated from the attached `hospital_directory.csv`. It contains records with usable coordinates and retains the fields available in that source. The browser asks permission before using your current location; without permission, search by hospital, district or state still works. Distance is straight-line distance, not driving distance.

The supplied CSV does not include ICU-bed counts or reliable real-time occupancy. These values are displayed as “Not reported” rather than invented. A production system would need verified hospital feeds/API credentials to retrieve current bed/ICU availability. Google Maps directions links are opened externally; no Maps API key is needed for the directory listing.

## Prototype limitations

Example incidents and ambulance fleet statuses are demo records. Report status changes are stored in this browser's local storage, and newly submitted demo emergency requests are added to that feed. Live multi-user updates, real dispatch, verified capacity, driver GPS, route ETA and authentication require a secure backend and authorized integrations. Do not use this prototype to coordinate a real emergency.

## Updated operations workspace (October 2026)
- The Hospital Network page uses a card-based capacity directory inspired by the provided CrowdPulse reference and includes an interactive OpenStreetMap with hospital pin markers.
- The Control Room includes a nearby-hospital map and the All / New / Processing / Completed emergency report filters.
- Alerts & Reported Emergencies lists the emergency records mirrored into `localStorage` by the reporting workflow.
- Hospital/ICU availability is shown only when present in the supplied directory. Missing or live occupancy values are not fabricated.
- The map uses OpenStreetMap tiles and the Leaflet / React Leaflet packages. An internet connection is required to load map tiles.

## Backend (added October 2026)

The Express + PostgreSQL backend lives in `backend/`. See `backend/README.md` to run it and `backend/docs/API_CONTRACT.md` for the routes and events the team must agree on.
