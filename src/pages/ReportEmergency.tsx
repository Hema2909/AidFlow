import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import LiveLocationMap from '../components/LiveLocationMap'
import './ReportEmergency.css'

type EmergencyType =
  | 'Cardiac'
  | 'Breathing'
  | 'Trauma'
  | 'Unresponsive'
  | 'Other'

const EMERGENCY_TYPES: {
  type: EmergencyType
  emoji: string
  label: string
}[] = [
  {
    type: 'Cardiac',
    emoji: '❤️',
    label: 'Chest pain / cardiac',
  },
  {
    type: 'Breathing',
    emoji: '🫁',
    label: 'Difficulty breathing',
  },
  {
    type: 'Trauma',
    emoji: '🩹',
    label: 'Severe injury / bleeding',
  },
  {
    type: 'Unresponsive',
    emoji: '⚠️',
    label: 'Unconscious / unresponsive',
  },
  {
    type: 'Other',
    emoji: '➕',
    label: 'Other',
  },
]

const HOSPITALS: Record<EmergencyType, string> = {
  Cardiac: 'St. Elias General — Cardiac Care Unit',
  Breathing: 'St. Elias General — Pulmonary & ER',
  Trauma: 'Fortis Trauma Center',
  Unresponsive: 'Fortis Trauma Center',
  Other: 'St. Elias General — Emergency Dept.',
}

type Step = 0 | 1 | 2
type Phase = 'form' | 'sending' | 'dispatched'

export default function ReportEmergency() {
  const [step, setStep] = useState<Step>(0)
  const [phase, setPhase] = useState<Phase>('form')

  const [selectedType, setSelectedType] =
    useState<EmergencyType | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [details, setDetails] = useState('')

  const [coords, setCoords] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const [ambId] = useState(
    () => `AMB-${400 + Math.floor(Math.random() * 99)}`
  )

  const [dispatchStage, setDispatchStage] = useState(1)

  /*
   * ==========================================
   * AUTOMATIC LOCATION DETECTION
   * ==========================================
   *
   * This runs as soon as the 2nd page opens.
   * It does NOT depend on Google Maps.
   *
   * The LiveLocationMap below will also update
   * the same coords state when its map loads.
   */

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error(
        'Geolocation is not supported by this browser.'
      )

      return
    }

    console.log(
      'AidFlow: requesting current location...'
    )

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        console.log(
          'AidFlow location detected:',
          newCoords
        )

        setCoords(newCoords)
      },

      (error) => {
        console.error(
          'AidFlow location error:',
          error.code,
          error.message
        )

        if (error.code === 1) {
          console.error(
            'Location permission was denied.'
          )
        } else if (error.code === 2) {
          console.error(
            'Location information is unavailable.'
          )
        } else if (error.code === 3) {
          console.error(
            'Location request timed out.'
          )
        }
      },

      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 30000,
      }
    )
  }, [])

  const canContinueStep0 = selectedType !== null

  const canContinueStep1 =
    name.trim().length > 1 &&
    phone.trim().length > 5

  const handleSend = (e: FormEvent) => {
    e.preventDefault()

    setPhase('sending')

    setTimeout(() => {
      setPhase('dispatched')

      setTimeout(() => {
        setDispatchStage(2)
      }, 4000)

      setTimeout(() => {
        setDispatchStage(3)
      }, 9000)
    }, 1600)
  }

  return (
    <div className="er-page">
      {/* HEADER */}
      <header className="er-header">
        <Link className="er-brand" to="/">
          <svg viewBox="0 0 32 32" fill="none">
            <path
              d="M16 2 L28 8 V17 C28 24 22 28.5 16 30 C10 28.5 4 24 4 17 V8 Z"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
            />

            <path
              d="M9 17 H13 L15 12 L18 21 L20 17 H23"
              stroke="#e11d2e"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          AidFlow
        </Link>

        <Link className="er-cancel" to="/">
          Cancel
        </Link>
      </header>

      {/* MAIN */}
      <main className="er-main">
        <div className="er-layout">
          {/* FORM CARD */}
          <div className="er-card">
            {phase === 'form' && (
              <>
                {/* STEPPER */}
                <div className="er-stepper">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`er-seg ${
                        i === step
                          ? 'active'
                          : i < step
                            ? 'done'
                            : ''
                      }`}
                    />
                  ))}
                </div>

                {/* ======================= */}
                {/* STEP 1 */}
                {/* ======================= */}

                {step === 0 && (
                  <div className="er-panel">
                    <div className="er-step-label">
                      Step 1 of 3 — Type
                    </div>

                    <div className="er-step-title">
                      What's happening?
                    </div>

                    <p className="er-step-sub">
                      Pick the option that best fits — this
                      helps us send the right kind of help.
                    </p>

                    <div className="er-chip-grid">
                      {EMERGENCY_TYPES.map((t) => (
                        <button
                          key={t.type}
                          type="button"
                          className={`er-chip ${
                            selectedType === t.type
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() =>
                            setSelectedType(t.type)
                          }
                        >
                          <span className="em">
                            {t.emoji}
                          </span>

                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="er-btn-row">
                      <button
                        type="button"
                        className="er-btn-continue"
                        disabled={!canContinueStep0}
                        onClick={() => setStep(1)}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* ======================= */}
                {/* STEP 2 */}
                {/* ======================= */}

                {step === 1 && (
                  <div className="er-panel">
                    <div className="er-step-label">
                      Step 2 of 3 — Details
                    </div>

                    <div className="er-step-title">
                      Your information
                    </div>

                    <p className="er-step-sub">
                      We'll use this to coordinate the
                      response and call you back if needed.
                    </p>

                    <div className="er-field">
                      <label htmlFor="name">
                        Full name
                      </label>

                      <input
                        id="name"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        placeholder="Your name"
                      />
                    </div>

                    <div className="er-field">
                      <label htmlFor="phone">
                        Phone number
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="er-field">
                      <label htmlFor="details">
                        Describe the emergency
                      </label>

                      <textarea
                        id="details"
                        value={details}
                        onChange={(e) =>
                          setDetails(e.target.value)
                        }
                        placeholder="What happened, number of people involved, any medical conditions..."
                      />
                    </div>

                    {/* LOCATION BOX */}
                    <div className="er-location-box">
                      <div className="er-location-header">
                        <div className="er-location-title">
                          <span className="er-location-icon">
                            📍
                          </span>

                          <div>
                            <strong>
                              Your location
                            </strong>

                            <span>
                              Your current location
                            </span>
                          </div>
                        </div>

                        <span
                          className={
                            coords
                              ? 'er-location-live'
                              : 'er-location-searching'
                          }
                        >
                          {coords
                            ? 'LIVE'
                            : 'LOCATING'}
                        </span>
                      </div>

                      <div className="er-location-coordinates">
                        <div>
                          <span>Latitude</span>

                          <strong>
                            {coords
                              ? coords.lat.toFixed(5)
                              : 'Locating...'}
                          </strong>
                        </div>

                        <div>
                          <span>Longitude</span>

                          <strong>
                            {coords
                              ? coords.lng.toFixed(5)
                              : 'Locating...'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* SATELLITE MAP */}
                    <div className="er-satellite-map">
                      <div className="er-map-heading">
                        <span>🛰️</span>

                        <div>
                          <strong>
                            Satellite location
                          </strong>

                          <small>
                            Your current position
                          </small>
                        </div>
                      </div>

                      <LiveLocationMap
                        mapTypeId="satellite"
                        zoom={16}
                        height={180}
                        onLocationChange={setCoords}
                      />
                    </div>

                    {/* BUTTONS */}
                    <div className="er-btn-row">
                      <button
                        type="button"
                        className="er-btn-back"
                        onClick={() => setStep(0)}
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        className="er-btn-continue"
                        disabled={!canContinueStep1}
                        onClick={() => setStep(2)}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* ======================= */}
                {/* STEP 3 */}
                {/* ======================= */}

                {step === 2 && (
                  <form
                    className="er-panel"
                    onSubmit={handleSend}
                  >
                    <div className="er-step-label">
                      Step 3 of 3 — Confirm
                    </div>

                    <div className="er-step-title">
                      Review &amp; send
                    </div>

                    <p className="er-step-sub">
                      Check the details below before
                      sending your request.
                    </p>

                    {/* REVIEW BOX */}
                    <div className="er-review-list">
                      <div className="er-review-row">
                        <span className="k">
                          Emergency type
                        </span>

                        <span className="v">
                          {selectedType ?? '—'}
                        </span>
                      </div>

                      <div className="er-review-row">
                        <span className="k">
                          Name
                        </span>

                        <span className="v">
                          {name || '—'}
                        </span>
                      </div>

                      <div className="er-review-row">
                        <span className="k">
                          Phone
                        </span>

                        <span className="v">
                          {phone || '—'}
                        </span>
                      </div>

                      <div className="er-review-row">
                        <span className="k">
                          Location
                        </span>

                        <span className="v">
                          {coords
                            ? `${coords.lat.toFixed(
                                5
                              )}, ${coords.lng.toFixed(5)}`
                            : 'Locating…'}
                        </span>
                      </div>
                    </div>

                    {/* LOCATION BOX */}
                    <div className="er-location-box">
                      <div className="er-location-header">
                        <div className="er-location-title">
                          <span className="er-location-icon">
                            📍
                          </span>

                          <div>
                            <strong>
                              Your location
                            </strong>

                            <span>
                              Confirm where help should
                              be sent
                            </span>
                          </div>
                        </div>

                        <span
                          className={
                            coords
                              ? 'er-location-live'
                              : 'er-location-searching'
                          }
                        >
                          {coords
                            ? 'LIVE'
                            : 'LOCATING'}
                        </span>
                      </div>

                      <div className="er-location-coordinates">
                        <div>
                          <span>Latitude</span>

                          <strong>
                            {coords
                              ? coords.lat.toFixed(5)
                              : 'Locating...'}
                          </strong>
                        </div>

                        <div>
                          <span>Longitude</span>

                          <strong>
                            {coords
                              ? coords.lng.toFixed(5)
                              : 'Locating...'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* SATELLITE MAP */}
                    <div className="er-satellite-map">
                      <div className="er-map-heading">
                        <span>🛰️</span>

                        <div>
                          <strong>
                            Confirm location
                          </strong>

                          <small>
                            Satellite view of your
                            current position
                          </small>
                        </div>
                      </div>

                      <LiveLocationMap
                        mapTypeId="satellite"
                        zoom={16}
                        height={180}
                        onLocationChange={setCoords}
                      />

                      {coords && (
                        <a
                          className="er-google-link"
                          href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open location in Google Maps ↗
                        </a>
                      )}
                    </div>

                    {/* BUTTONS */}
                    <div className="er-btn-row">
                      <button
                        type="button"
                        className="er-btn-back"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="er-btn-send"
                      >
                        Send emergency request
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* ======================= */}
            {/* SENDING */}
            {/* ======================= */}

            {phase === 'sending' && (
              <div className="er-sending">
                <div className="er-pulse">
                  🚨
                </div>

                <p>
                  Sending your request and locating
                  nearby ambulances…
                </p>
              </div>
            )}

            {/* ======================= */}
            {/* DISPATCHED */}
            {/* ======================= */}

            {phase === 'dispatched' &&
              selectedType && (
                <div className="er-dispatch">
                  <div className="er-dispatch-head">
                    <div className="er-dispatch-icon">
                      ✓
                    </div>

                    <div>
                      <h2>
                        Request received
                      </h2>

                      <p>
                        Ambulance {ambId} is being
                        coordinated for you
                      </p>
                    </div>
                  </div>

                  <div className="er-timeline">
                    <div className="er-tl-item done">
                      <div className="dot">
                        ✓
                      </div>

                      <div className="txt">
                        <div className="t">
                          Request received
                        </div>

                        <div className="d">
                          AidFlow logged your
                          location and details
                        </div>
                      </div>
                    </div>

                    <div
                      className={`er-tl-item ${
                        dispatchStage === 1
                          ? 'active'
                          : 'done'
                      }`}
                    >
                      <div className="dot">
                        {dispatchStage > 1
                          ? '✓'
                          : ''}
                      </div>

                      <div className="txt">
                        <div className="t">
                          Finding nearest
                          ambulance
                        </div>

                        <div className="d">
                          Matching you with an
                          available unit
                        </div>
                      </div>
                    </div>

                    <div
                      className={`er-tl-item ${
                        dispatchStage === 2
                          ? 'active'
                          : dispatchStage > 2
                            ? 'done'
                            : ''
                      }`}
                    >
                      <div className="dot">
                        {dispatchStage > 2
                          ? '✓'
                          : ''}
                      </div>

                      <div className="txt">
                        <div className="t">
                          Ambulance en route
                        </div>

                        <div className="d">
                          Unit dispatched to your
                          location
                        </div>
                      </div>
                    </div>

                    <div
                      className={`er-tl-item ${
                        dispatchStage === 3
                          ? 'active'
                          : ''
                      }`}
                    >
                      <div className="dot"></div>

                      <div className="txt">
                        <div className="t">
                          Arriving
                        </div>

                        <div className="d">
                          Ambulance approaching
                          your location
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="er-info-grid">
                    <div className="er-info-box">
                      <div className="k">
                        Estimated arrival
                      </div>

                      <div className="v eta">
                        6–9 min
                      </div>
                    </div>

                    <div className="er-info-box">
                      <div className="k">
                        Assigned hospital
                      </div>

                      <div className="v small">
                        {HOSPITALS[selectedType]}
                      </div>
                    </div>
                  </div>

                  <div className="er-safety-line">
                    <strong>
                      This is a student/research
                      prototype.
                    </strong>{' '}
                    If this is a genuine,
                    life-threatening emergency,
                    call your local emergency
                    number directly — do not rely
                    on this app alone.
                  </div>

                  <button
                    className="er-cancel-req"
                    onClick={() =>
                      window.location.reload()
                    }
                  >
                    Cancel this request
                  </button>
                </div>
              )}
          </div>

          {/* RIGHT SIDE LOCATION BOX */}
          <div className="er-side">
            <div className="er-side-card">
              <div className="er-side-head">
                <div
                  className={`er-loc-dot ${
                    coords ? 'live' : ''
                  }`}
                />

                <h3>Your location</h3>
              </div>

              <p
                className={`er-loc-status ${
                  coords ? 'ok' : ''
                }`}
              >
                {coords
                  ? 'Location captured automatically ✓'
                  : 'Detecting your location…'}
              </p>

              <div className="er-coord-row">
                <div className="er-coord-box">
                  <div className="k">Lat</div>

                  <div className="v">
                    {coords
                      ? coords.lat.toFixed(4)
                      : '—'}
                  </div>
                </div>

                <div className="er-coord-box">
                  <div className="k">Lng</div>

                  <div className="v">
                    {coords
                      ? coords.lng.toFixed(4)
                      : '—'}
                  </div>
                </div>
              </div>

              {coords && (
                <a
                  className="er-maps-link"
                  href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps ↗
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="er-bottom-note">
          AidFlow AI-assisted dispatch coordination —
          not a replacement for professional emergency
          services.
        </p>
      </main>
    </div>
  )
}