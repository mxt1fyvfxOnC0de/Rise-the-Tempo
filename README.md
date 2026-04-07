# Rise The Tempo

Rise The Tempo is a Fitness-to-Soccer-Card platform with:

- Premium glassmorphism React UI (Player Card, Upgrader Dashboard, Radar Chart, Clan Wars + Activity Feed).
- Node.js/Express API for persisting user stats, clan leaderboard updates, and activity feed.
- Hourly clan power history snapshots for evergreen progression analytics.

## Stack

- Frontend: React + Tailwind CSS + Framer Motion + lucide-react
- Backend: Node.js + Express + MongoDB (Mongoose)

## Run locally

```bash
npm install
npm run dev:frontend
npm run dev:backend
```

## API

- `POST /api/user/stats` save or update player stats.
- `GET /api/clans/leaderboard` leaderboard payload for polling.
- `GET /api/clans/feed` live activity list.

## Deployment

- Frontend targets Vercel.
- Backend targets Railway.
- Configure `MONGODB_URI` and optional `MONGODB_DB`.
