export default function Footer() {
  return (
    <footer>
      <div className="wrap">

        {/* Footer Top */}
        <div className="foot-top">

          {/* AidFlow Branding */}
          <div className="brand">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              width="26"
              height="26"
            >
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

            <div>
              <span style={{ fontWeight: 600 }}>
                AidFlow
              </span>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--muted)',
                }}
              >
                AI-Powered Emergency Response
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="foot-links">

            <a href="#home">
              Home
            </a>

            <a href="#how">
              How It Works
            </a>

            <a href="#about">
              About
            </a>

          </div>
        </div>

        {/* Copyright */}
        <div className="foot-bottom">
          <span>
            © 2026 AidFlow
          </span>

          <span>
            Student Research Prototype
          </span>
        </div>

      </div>
    </footer>
  )
}