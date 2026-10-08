# AidFlow — Landing Page (React + TypeScript + Vite)

## Setup
```
npm install
npm run dev
```
Then open the local URL Vite prints (usually http://localhost:5173).

## Scripts
- `npm run dev` — start the dev server with hot reload
- `npm run build` — type-check and build a production bundle into `dist/`
- `npm run preview` — preview the production build locally

## Structure
```
index.html              Vite entry HTML (fonts, page title, favicon)
src/
  main.tsx               React root
  App.tsx                Composes all sections
  index.css               All global styles (ported 1:1 from the static build)
  components/
    Header.tsx             Nav bar + mobile menu (normal document flow — scrolls with the page)
    Hero.tsx                Video background, overlay, title, buttons
    AnimatedHeading.tsx      Character-by-character "AidFlow" entrance animation
    FadeIn.tsx               Reusable fade-in wrapper used for the hero copy/buttons
    HowItWorks.tsx
    AISection.tsx
    Disclaimer.tsx
    Footer.tsx
```

## Notes
- The "Request Ambulance" button currently shows a placeholder alert instead of routing to `/emergency` — wire up your router (React Router, etc.) there once the next page exists.
- The hero background video URL is a placeholder stock clip — swap the `VIDEO_URL` constant in `Hero.tsx` for your own.
- This was verified with `npm install && npm run build` before packaging (no type errors, clean production build).
