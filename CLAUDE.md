# North Forks Apartments — Project Context

## What This Is
A maintenance request management system for a residential apartment complex with 15 units. Tenants submit maintenance requests via a web app (accessed through a QR Code), and 3 administrators manage and track all requests.

## Language Rules
- **Conversations and planning**: Portuguese (between developer and Claude)
- **Product (everything the user sees)**: English only — all buttons, labels, forms, emails, status text, error messages, success messages, dashboard content

## Users
| Role | Count | Authentication | Access |
|------|-------|---------------|--------|
| Tenant | Variable, no account | None — fills data per request | Opens requests, views status via unique email link |
| Administrator | Exactly 3, equal power | Individual login + password | Full — all units, all requests, all settings |

No technician role. No hierarchy between admins. All 3 admins can do everything.

## QR Code Model
- **Single generic QR Code** for the entire building (not one per unit)
- The QR Code is just a shortcut to the web app URL
- Unit is selected manually by the tenant in the form (dropdown with 15 units)
- No token system, no per-unit authentication

## Request Flow
1. Tenant scans QR Code → web app opens on emergency warning screen
2. Tenant confirms "not an emergency" → form opens
3. Tenant fills: apartment (dropdown), name, email (required), phone (optional), room, category, description, photos/videos, entry authorization, perceived priority, observations
4. Submits → confirmation screen with protocol number
5. System sends confirmation email with: protocol, summary, unique status link (long random token, not sequential)
6. As admins update status → tenant receives email for each relevant transition

## Status Values (exact ENUM values in DB)
`new` → `reviewed` → `scheduled` → `in_progress` → `waiting_on_parts` → `completed` → `closed`

Email notifications to tenant on: `scheduled`, `in_progress`, `waiting_on_parts`, `completed` (skip `reviewed` to avoid notification fatigue)

## Business Rules
- `completed` status requires `resolution_summary` field filled (enforced by DB trigger)
- `closed` requests cannot be reopened — a new request must reference the old protocol
- Internal notes are NEVER visible to tenants — not in status page, not in emails (absolute rule)
- Every status change records which admin made it + timestamp (immutable audit trail)
- `sla_deadline` is calculated automatically at creation from the category's `sla_hours`

## Security
- `public_token` on each request: 48-char hex random string, never sequential — this is the tenant's only access key to view their request status
- Media storage: always private bucket with signed URLs, never public
- 3 admin accounts = 3 individual logins, never a shared password

## Design System
- **Dark mode as default everywhere** (tenant area + admin area)
- Inspired by Apple/iOS: clean, minimal, lots of white space, rounded cards
- Color palette (dark mode):
  - Background: `#000000` / `#1c1c1e`
  - Elevated surfaces (cards): `#1c1c1e` / `#2c2c2e`
  - Primary text: `#f5f5f7`
  - Secondary text: `#98989d`
  - Blue (CTA): `#0a84ff`
  - Green (success): `#30d158`
  - Red (emergency/error): `#ff453a`
  - Amber (warning/internal): `#ff9f0a`
  - Borders: `rgba(255,255,255,0.08)`
- Typography: `-apple-system, 'SF Pro Display', Inter, sans-serif`
- Border radius: `20px` for cards, `14px` for inputs/buttons
- The emergency screen is the only element that breaks the palette (full red accent)

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Email**: Resend + react-email
- **Deploy**: Vercel

## Database Schema
Schema file: `supabase/migrations/001_initial_schema.sql`

Tables:
- `units` — 15 fixed units, no token, no QR binding
- `categories` — configurable by admins, each has `sla_hours`
- `admin_users` — exactly 3 accounts, equal permissions
- `maintenance_requests` — core table; has `public_token` (48-char hex), `tenant_priority`, `admin_priority`, `technician_name` (free text, no entity), `resolution_summary` (required for `completed`)
- `request_media` — file metadata; actual binary in Supabase Storage (private)
- `request_notes` — `is_internal` defaults to `TRUE` (safe by default)
- `status_history` — immutable audit log; every status change writes here with author

## Design Reference
File: `design/mockup-dark-en.html` — complete interactive prototype with 9 screens, dark mode, all text in English. Use this as the visual reference for all implementation decisions.

## Key Decisions Already Made (do not revisit)
1. No login for tenants — ever (for this MVP)
2. Generic QR Code, not per-unit
3. 3 admins, equal power, no hierarchy
4. No technician role in the system
5. Technician name = free text field on request, not a system entity
6. Token is fixed per request (never rotates) — and per our decision, unit tokens don't exist
7. Dark mode everywhere, English in the product
8. Spam/captcha protection = backlog item, not MVP
9. Cost/budget field = backlog item, not MVP (but column can be added to schema)
