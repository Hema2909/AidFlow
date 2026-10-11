import { Link } from 'react-router-dom'
import FadeIn from './FadeIn'
import AnimatedHeading from './AnimatedHeading'
import Logo from './Logo'

export default function Hero() {
  return (
    <section className="hero" id="home">
      <video
        className="hero-video"
        src="/hero-city.mp4"
        poster="/hero-city-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      <div className="hero-overlay" />

      <div className="hero-inner">
        <div className="hero-grid">

          {/* =========================
              AIDFLOW BRAND
             ========================= */}

          <div className="brand-lockup">

            {/* Shield Logo */}
            <Logo className="hero-logo" />

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


/* Make the operations entry point visible from the landing page. */
