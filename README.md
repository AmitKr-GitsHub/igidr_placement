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
