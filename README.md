# Placement Committee Accountability Platform

A starter website concept for tracking placement committee activity with an always-on AI assistant, while sharing only non-sensitive aggregate performance on a public dashboard.

## Vision

Build a transparent system that helps placement committee members:

- stay accountable,
- complete assigned work on time,
- maintain structured records of outreach and outcomes,
- receive intelligent reminders and weekly performance assessments.

At the same time, publish **privacy-safe public metrics** that reflect overall committee effectiveness without exposing personal or sensitive details.

## Included in this repo

- `index.html` – product overview and dashboard mockup.
- `styles.css` – clean responsive styling.
- `app.js` – sample metric calculations and rendered public dashboard cards.
- `server.js` – Express + Socket.IO realtime backend.
- `telegramBot.js` – Telegram bridge for DM sync and agent interception.
- `prisma/schema.prisma` – PostgreSQL schema for users/chat rooms/messages.
- `src/ChatInterface.jsx` – basic React chat interface.
- `PRD.md` – detailed product and implementation blueprint.

## Run the system locally (end-to-end)

### 1) Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+ (local or remote)
- (Optional) Telegram bot token from BotFather

### 2) Install dependencies

```bash
npm install
```

If this is a fresh clone and lockfile is not present, you can install explicitly:

```bash
npm install express socket.io telegraf pg @prisma/client@6.7.0 socket.io-client react
npm install -D prisma@6.7.0
```

### 3) Configure environment variables

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/placement_db?schema=public"
TELEGRAM_BOT_TOKEN="<your-bot-token>"
PORT=3000
```

> If you are not testing Telegram, keep `TELEGRAM_BOT_TOKEN` empty or omit it.

### 4) Prepare database

```bash
npx prisma generate --schema prisma/schema.prisma
npx prisma db push --schema prisma/schema.prisma
```

### 5) Start backend server

```bash
npm start
```

The backend health endpoint will be available at:

```text
http://localhost:3000/health
```

### 6) Start static dashboard preview

In a second terminal:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

### 7) Use React chat component

Import `src/ChatInterface.jsx` into your React app and render it:

```jsx
import ChatInterface from "./src/ChatInterface";

export default function App() {
  return <ChatInterface serverUrl="http://localhost:3000" senderId={1} />;
}
```

## Quick local checks

```bash
node --check server.js
node --check telegramBot.js
node --check app.js
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public" npx prisma validate --schema prisma/schema.prisma
```

## Resolving merge conflicts (every time)

Use this helper before opening or updating a PR to catch conflicts early:

```bash
scripts/resolve-conflicts.sh main
```

What it does:

- verifies your working tree is clean,
- fetches latest remote branches,
- rebases your current branch on top of `origin/main`,
- if conflicts occur, prints conflicted files and exact next commands (`git add ...`, `git rebase --continue`, `git rebase --abort`).
- `PRD.md` – detailed product and implementation blueprint.

## Quick start

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Suggested next build steps

1. Add authentication and role-based access (member/admin/public).
2. Create a backend API (FastAPI/Node) with a Postgres database.
3. Add event ingestion from tasks (calls, emails, lead updates, status changes).
4. Integrate AI agent for reminders and weekly summaries.
5. Launch privacy-filtered public dashboard endpoint.

## Backend quick setup (Node.js + Express + Prisma + PostgreSQL)

```bash
npm init -y
npm install express socket.io telegraf pg @prisma/client@6.7.0
npm install express pg @prisma/client@6.7.0
npm install -D prisma@6.7.0
npx prisma init --datasource-provider postgresql
# replace prisma/schema.prisma with the schema in this repository
# set DATABASE_URL in .env, for example:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/placement_db?schema=public"
# TELEGRAM_BOT_TOKEN="<your-bot-token>"
npx prisma generate
npx prisma db push
```

```bash
node server.js
```

## Resolving merge conflicts (every time)

Use this helper before opening or updating a PR to catch conflicts early:

```bash
scripts/resolve-conflicts.sh main
```

What it does:

- verifies your working tree is clean,
- fetches latest remote branches,
- rebases your current branch on top of `origin/main`,
- if conflicts occur, prints conflicted files and exact next commands (`git add ...`, `git rebase --continue`, `git rebase --abort`).

## React chat interface component

A basic Socket.IO-powered React UI is available at:

- `src/ChatInterface.jsx`

It includes:

- sidebar room selection for `ADMIN_PLACECOM`, `PLACECOM_ONLY`, and `DM`,
- live message list subscribed to `newMessage`,
- input and send flow using `sendMessage` socket event.

Install frontend dependencies (in your React app):

```bash
npm install react socket.io-client
npx prisma generate
npx prisma db push
```
