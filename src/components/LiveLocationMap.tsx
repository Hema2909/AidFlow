import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

interface LiveLocationMapProps {
  apiKey?: string
  mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  zoom?: number
  height?: string | number
  onLocationChange?: (coords: {
    lat: number
    lng: number
  }) => void
}

declare global {
  interface Window {
    google?: any
  }
}

let googleMapsPromise: Promise<void> | null = null

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) {
    return Promise.resolve()
  }

  if (googleMapsPromise) {
    return googleMapsPromise
  }

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-aidflow-google-maps]'
    ) as HTMLScriptElement | null

    if (existingScript) {
      if (window.google?.maps) {
        resolve()
        return
      }

      existingScript.addEventListener(
        'load',
        () => {
          if (window.google?.maps) {
            resolve()
          } else {
            googleMapsPromise = null
            reject(
              new Error(
                'Google Maps loaded but was not initialized'
              )
            )
          }
        },
        { once: true }
      )

      existingScript.addEventListener(
        'error',
        () => {
          googleMapsPromise = null
          reject(
            new Error('Google Maps failed to load')
          )
        },
        { once: true }
      )

      return
    }

    const script = document.createElement('script')

    script.src =
      `https://maps.googleapis.com/maps/api/js` +
      `?key=${encodeURIComponent(apiKey)}` +
      `&v=weekly`

    script.async = true
    script.defer = true

    script.dataset.aidflowGoogleMaps = 'true'

    script.onload = () => {
      if (window.google?.maps) {
        resolve()
      } else {
        googleMapsPromise = null
        reject(
          new Error(
            'Google Maps loaded but was not initialized'
          )
        )
      }
    }

    script.onerror = () => {
      googleMapsPromise = null
      reject(
        new Error('Google Maps failed to load')
      )
    }

    document.head.appendChild(script)
  })

  return googleMapsPromise
}

export default function LiveLocationMap({
  apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  mapTypeId = 'roadmap',
  zoom = 16,
  height = 180,
  onLocationChange,
}: LiveLocationMapProps) {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(null)

  const mapRef = useRef<any>(null)

  const markerRef = useRef<any>(null)

  const watchIdRef =
    useRef<number | null>(null)

  const latestCoordsRef =
    useRef<{
      lat: number
      lng: number
    } | null>(null)

  const [status, setStatus] = useState<
    'loading' | 'ready' | 'denied' | 'error'
  >('loading')

  const [message, setMessage] = useState(
    'Getting your current location…'
  )

  /*
   * Create or update Google Map
   */
  const updateMap = (
    coords: {
      lat: number
      lng: number
    }
  ) => {
    if (!window.google?.maps) {
      return
    }

    if (!mapContainerRef.current) {
      return
    }

    /*
     * Create map
     */
    if (!mapRef.current) {
      mapRef.current =
        new window.google.maps.Map(
          mapContainerRef.current,
          {
            center: coords,
            zoom,
            mapTypeId,

            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,

            clickableIcons: false,

            gestureHandling: 'greedy',
          }
        )

      markerRef.current =
        new window.google.maps.Marker({
          position: coords,
          map: mapRef.current,

          title: 'Your current location',

          animation:
            window.google.maps.Animation.DROP,
        })

      return
    }

    /*
     * Update map center
     */
    mapRef.current.setCenter(coords)

    /*
     * Update marker
     */
    if (markerRef.current) {
      markerRef.current.setPosition(coords)
    }
  }

  useEffect(() => {
    let cancelled = false

    /*
     * ==============================================
     * STEP 1
     * START BROWSER LOCATION DETECTION
     * ==============================================
     */

    if (!navigator.geolocation) {
      setStatus('error')

      setMessage(
        'Geolocation is not supported by this browser.'
      )

      return
    }

    /*
     * Successful location
     */
    const handleLocation = (
      position: GeolocationPosition
    ) => {
      if (cancelled) {
        return
      }

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      console.log(
        'AidFlow current location:',
        coords
      )

      /*
       * Store latest coordinates
       */
      latestCoordsRef.current = coords

      /*
       * Send coordinates to parent
       */
      if (onLocationChange) {
        onLocationChange(coords)
      }

      /*
       * Update Google Map if available
       */
      updateMap(coords)

      /*
       * Location successfully detected
       */
      setStatus('ready')

      setMessage(
        'Your current location'
      )
    }

    /*
     * Location error
     */
    const handleLocationError = (
      error: GeolocationPositionError
    ) => {
      if (cancelled) {
        return
      }

      console.error(
        'AidFlow location error:',
        error.code,
        error.message
      )

      /*
       * Permission denied
       */
      if (error.code === 1) {
        setStatus('denied')

        setMessage(
          'Location permission was denied. Please allow location access for localhost.'
        )

        return
      }

      /*
       * Position unavailable
       */
      if (error.code === 2) {
        setStatus('error')

        setMessage(
          'Your location could not be determined. Please check your device location settings.'
        )

        return
      }

      /*
       * Timeout
       */
      if (error.code === 3) {
        setStatus('error')

        setMessage(
          'Location request timed out. Please try again.'
        )

        return
      }

      /*
       * Unknown error
       */
      setStatus('error')

      setMessage(
        'Unable to get your current location.'
      )
    }

    /*
     * ==============================================
     * GET LOCATION IMMEDIATELY
     *
     * Google Maps is NOT loaded first.
     * ==============================================
     */

    navigator.geolocation.getCurrentPosition(
      handleLocation,
      handleLocationError,
      {
        /*
         * false is more reliable on desktop
         * browsers than forcing GPS.
         */
        enableHighAccuracy: false,

        /*
         * Give browser enough time
         */
        timeout: 30000,

        /*
         * Allow recent location
         */
        maximumAge: 30000,
      }
    )

    /*
     * ==============================================
     * CONTINUOUS LOCATION WATCH
     * ==============================================
     */

    watchIdRef.current =
      navigator.geolocation.watchPosition(
        handleLocation,

        (error) => {
          console.warn(
            'GPS watch error:',
            error.code,
            error.message
          )
        },

        {
          enableHighAccuracy: false,

          timeout: 30000,

          maximumAge: 30000,
        }
      )

    /*
     * ==============================================
     * STEP 2
     * LOAD GOOGLE MAPS SEPARATELY
     * ==============================================
     */

    if (apiKey) {
      loadGoogleMaps(apiKey)
        .then(() => {
          if (cancelled) {
            return
          }

          console.log(
            'Google Maps loaded successfully'
          )

          /*
           * If location was already obtained,
           * create the map now.
           */
          if (latestCoordsRef.current) {
            updateMap(
              latestCoordsRef.current
            )
          }
        })
        .catch((error) => {
          console.error(
            'Google Maps error:',
            error
          )

          /*
           * Do NOT mark GPS as failed.
           *
           * Location detection and Google Maps
           * are independent.
           */
          if (
            !latestCoordsRef.current &&
            !cancelled
          ) {
            setMessage(
              'Getting your location…'
            )
          }
        })
    } else {
      console.warn(
        'VITE_GOOGLE_MAPS_API_KEY is missing'
      )
    }

    /*
     * ==============================================
     * CLEANUP
     * ==============================================
     */

    return () => {
      cancelled = true

      if (
        watchIdRef.current !== null
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        )

        watchIdRef.current = null
      }

      mapRef.current = null

      markerRef.current = null

      latestCoordsRef.current = null
    }
  }, [
    apiKey,
    mapTypeId,
    zoom,
    onLocationChange,
  ])

  return (
    <div
      style={{
        position: 'relative',

        width: '100%',

        height,

        overflow: 'hidden',

        borderRadius: 10,

        background: '#111827',
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',

          height: '100%',
        }}
      />

      {status !== 'ready' && (
        <div
          style={overlayStyle}
        >
          <div>
            <div
              style={{
                fontSize: 24,

                marginBottom: 8,
              }}
            >
              📍
            </div>

            <div>
              {message}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const overlayStyle: CSSProperties = {
  position: 'absolute',

  inset: 0,

  display: 'flex',

  alignItems: 'center',

  justifyContent: 'center',

  background:
    'rgba(8, 11, 20, 0.88)',

  color: '#f2f5f9',

  fontSize: 13,

  padding: 20,

  textAlign: 'center',

  lineHeight: 1.5,
}