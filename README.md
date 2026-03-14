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
