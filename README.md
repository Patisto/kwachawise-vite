# KwachaWise — Frontend (Vite + React)

Plain Vite + React + TypeScript + Tailwind v4 + React Router + Framer Motion.
Same screens as the Next.js version, ported over — no App Router, no server
components, no framework-specific dev-server quirks.

## Screens

- `/` — Home dashboard
- `/insights` — balance trend, Kwacha Score, first-run intro sheet
- `/transactions` — searchable list, filter bottom sheet
- `/transactions/:id` — detail view
- `/sort` — swipe-sort game
- `/profile`, `/profile/account`, `/profile/notifications`
- `/budget` — empty state

## Run it

```bash
npm install
npm run dev
```

Opens on **http://localhost:3000** (configured in `vite.config.ts`, matching
Next's default so old bookmarks/muscle memory still work).

`server.host: true` is set in `vite.config.ts`, which makes Vite bind to
`0.0.0.0` instead of `127.0.0.1` only. That's worth knowing if you're on a
remote box / container / VS Code Remote-SSH setup — binding to all interfaces
is what most port-forwarding tools expect to see before they'll forward a
port for you.

## If localhost still refuses to connect

That symptom (server prints "Ready" but curl/browser get connection refused)
almost always means the shell running `npm run dev` isn't on the same network
namespace as whatever's opening the browser — i.e. you're in a container,
VS Code Remote, or a cloud VM. Two things to check:

1. `curl http://localhost:3000` from *inside the same terminal* right after
   "ready" prints. If that also fails, the process is exiting silently —
   run it in the foreground and watch for a crash after the ready banner.
2. If curl from that terminal works but your browser doesn't: it's a
   port-forwarding gap. VS Code Remote usually auto-forwards, but check the
   **Ports** tab and forward 3000 manually if it's not listed.

## Data

Mock data lives in `src/lib/data.ts` — same shape as the Next version, no
backend wired up.
