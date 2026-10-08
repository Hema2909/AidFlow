export default function Header() {
  return (
    <header>
      <nav className="nav glass">

        {/* AidFlow Logo */}
        <div className="brand">
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

          <span>AidFlow</span>
        </div>

        {/* Only Login and Register remain in the top bar */}
        <div className="nav-right">
          <a
            href="#"
            className="btn-ghost"
          >
            Login
          </a>

          <a
            href="#"
            className="btn-cyan"
          >
            Register
          </a>
        </div>

      </nav>
    </header>
  )
}