# Product Requirements Draft

## 1) Problem statement

Placement committees often lose momentum due to inconsistent follow-ups, missing records, and unclear ownership of tasks. This project creates a 24x7 AI-supported workflow where activities are logged, reminders are automated, and performance is measured weekly.

## 2) Core goals

1. Improve accountability with clear task ownership and deadlines.
2. Track outreach pipeline from company targeting to offer closure.
3. Reduce average response and completion times.
4. Provide a public, non-sensitive performance dashboard.

## 3) Primary users

- **Committee member**: Executes assigned outreach and updates outcomes.
- **Committee lead/admin**: Assigns tasks, reviews quality, escalates delays.
- **Public viewer**: Sees aggregate progress without personal data.

## 4) Key feature modules

### A. Task & outreach tracking
- Task creation with owner, priority, due date, and status.
- Company outreach records: contact type, timestamp, outcome, next action.
- Lead lifecycle: new lead -> in discussion -> scheduled process -> closed.

### B. AI agent (24x7)
- Reminder engine for pending/overdue tasks.
- Missed-update nudges (e.g., no activity for 48 hours).
- Weekly member assessment summary (private to committee/admin).
- Suggested next actions based on pipeline stage.

### C. Performance analytics
- Unique companies reached.
- Leads generated and conversion rates.
- Average first-response time.
- Average task completion time.
- SLA adherence (% of tasks closed on time).

### D. Public dashboard (privacy-safe)
- Displays only aggregate metrics.
- Hides names, phone numbers, email addresses, and sensitive notes.
- Uses date-range filters and trend charts.

## 5) Data model (MVP)

- `users` (id, role, name, active)
- `companies` (id, name, sector, status)
- `leads` (id, company_id, source, stage, created_at, closed_at)
- `tasks` (id, owner_id, type, priority, due_at, completed_at, status)
- `activities` (id, actor_id, entity_type, entity_id, action, created_at)
- `weekly_reviews` (id, user_id, week_start, score, strengths, improvements)

## 6) AI assessment rubric (example)

- Timeliness (30%)
- Completion reliability (25%)
- Outreach consistency (20%)
- Lead progression impact (15%)
- Record quality and clarity (10%)

Use rubric for internal coaching, not punitive ranking.

## 7) Privacy and governance

- Public API serves only anonymized aggregates.
- Internal notes and personal identifiers never exposed publicly.
- Data retention policy with access logs.
- Manual override option for unfair AI assessments.

## 8) Suggested architecture

- Frontend: React/Next.js dashboard + public landing/dashboard.
- Backend: FastAPI/Node service with REST endpoints.
- Database: PostgreSQL.
- Queue/worker: Celery/BullMQ for reminders and weekly jobs.
- AI service: LLM-assisted summarization and recommendation layer.

## 9) MVP milestones

1. Internal task + activity logging.
2. Reminder notifications and overdue alerts.
3. Weekly scorecard generation.
4. Public aggregate dashboard.
5. Admin audit and export.
