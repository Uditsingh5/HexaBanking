# Hexa Secure Banking — Frontend

Production frontend for the Hexa ledger API in this repository.

## Stack

- React 19.2
- TypeScript
- Vite
- Zustand
- React Router

## Run locally

From the repository root, start the API:

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Put Mongo, JWT, and email values in `server/.env` — not the repo root.

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to `http://localhost:3000`, which keeps cookie authentication on the same origin.

Set `CLIENT_ORIGIN=http://localhost:5173` in the API `.env` if you call the API without the proxy.

## Auth notes

There is no `/api/auth/me` endpoint. The app restores a session by calling `GET /api/account` with credentials and keeping non-sensitive profile fields in `sessionStorage`.

## Intentionally not faked

- Transaction history (no GET endpoint on the API)
- Currency conversion
- Analytics charts
- Admin initial-funds UI (`systemUser` is not returned by login/register)
