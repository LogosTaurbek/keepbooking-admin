# KeepBooking Admin

Web admin panel for restaurant owners/managers on the [KeepBooking](https://github.com/LogosTaurbek/keep-booking) platform (a separate repo/backend - see `VITE_API_BASE_URL`).

## Tech stack

- React 19 · Vite · TypeScript
- Tailwind CSS (no component kit)
- react-router-dom

## Project structure

```
src/
├── api/          fetch client (JWT + auto-refresh-on-401), typed request/response DTOs
├── auth/          auth context, protected-route guard
├── components/    shared layout
└── pages/         one file per route
```

## Quick start

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev             # http://localhost:3000
```

Requires the KeepBooking backend running (see that repo's README) - `http://localhost:8080` by default,
already whitelisted in the backend's CORS config for `http://localhost:3000`.

## Current scope

Auth (login/logout, JWT stored in localStorage with silent refresh) + restaurant CRUD
(create/list/edit) for the authenticated owner, with first-time company onboarding since a
restaurant can't be created without an owning company. No delete - the backend manages restaurant
lifecycle via moderation status, not hard deletion.
