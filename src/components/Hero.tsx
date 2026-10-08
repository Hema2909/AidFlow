import { Link } from 'react-router-dom'
import FadeIn from './FadeIn'
import AnimatedHeading from './AnimatedHeading'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4'

export default function Hero() {
  return (
    <section className="hero" id="home">
      <video
        className="hero-video"
        autoPlay
        loop
        muted
        playsInline
        src={VIDEO_URL}
      />

      <div className="hero-overlay" />

      <div className="hero-inner">
        <div className="hero-grid">

          {/* =========================
              AIDFLOW BRAND
             ========================= */}

          <div className="brand-lockup">

            {/* Shield Logo */}
            <svg
              className="hero-logo"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M16 2 L28 8 V17 C28 24 22 28.5 16 30 C10 28.5 4 24 4 17 V8 Z"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.4"
              />

              <path
                d="M9 17 H13 L15 12 L18 21 L20 17 H23"
                stroke="#ff4545"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* AidFlow + Subtitle */}
            <div className="brand-name-group">

              <AnimatedHeading
                text="AidFlow"
                className="hero-h"
              />

              <FadeIn
                as="p"
                className="brand-subtitle"
                delay={700}
                duration={1000}
              >
                AI-Powered Emergency Response System
              </FadeIn>

            </div>
          </div>


          {/* =========================
              DESCRIPTION
             ========================= */}

          <FadeIn
            as="p"
            className="sub"
            delay={1000}
            duration={1000}
          >
            AidFlow connects you with emergency ambulance assistance
            and helps coordinate the right response when you need it most.
          </FadeIn>


          {/* =========================
              BUTTONS
             ========================= */}

          <FadeIn
            as="div"
            className="hero-actions"
            delay={1300}
            duration={1000}
          >
            <Link to="/emergency" className="btn-emergency">
              🚨 Request Ambulance
            </Link>

            <a
              href="#how"
              className="btn-secondary"
            >
              Learn How AidFlow Helps
            </a>
          </FadeIn>


          {/* =========================
              SAFETY MESSAGE
             ========================= */}

          <FadeIn
            as="p"
            className="safety-note"
            delay={1400}
            duration={1000}
          >
            For genuine emergencies, use this service to begin an ambulance request.
          </FadeIn>

        </div>
      </div>
    </section>
  )
}
