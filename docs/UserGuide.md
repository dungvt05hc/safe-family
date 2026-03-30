# SafeFamily — User Guide

SafeFamily helps households organize family members, track digital risks, report incidents, and get practical help to improve online safety.

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [First-Time Setup Journey](#2-first-time-setup-journey)
3. [Dashboard](#3-dashboard)
4. [Family Members](#4-family-members)
5. [Accounts](#5-accounts)
6. [Devices](#6-devices)
7. [Digital Safety Assessment](#7-digital-safety-assessment)
8. [Checklist](#8-checklist)
9. [Incidents](#9-incidents)
10. [Bookings](#10-bookings)
11. [Reports](#11-reports)
12. [Settings](#12-settings)
13. [Admin Panel (Admin Role Only)](#13-admin-panel-admin-role-only)
14. [Quick Route Reference](#14-quick-route-reference)

## 1. Getting Started

### Create your account

1. Open `/register`.
2. Enter your email address.
3. Enter your display name.
4. Enter a password (minimum 8 characters).
5. Select **Create account**.

After account creation, you are signed in and taken to your dashboard.

### Sign in to an existing account

1. Open `/login`.
2. Enter your email and password.
3. Select **Sign in**.

If you tried to open a protected page first, SafeFamily returns you to that page after successful login.

### Guest-only pages

- `/login` and `/register` are guest-only pages.
- If you are already signed in, opening these pages redirects you to `/dashboard`.

## 2. First-Time Setup Journey

This is the recommended order for new users.

1. Create account at `/register`.
2. Create your family profile at `/family/new`.
3. Add family members at `/family/members`.
4. Add accounts at `/accounts`.
5. Add devices at `/devices`.
6. Run your first assessment at `/assessment`.
7. Review checklist actions at `/checklists`.

Notes:

- Family profile is foundational. Many features are much more useful after creating a family.
- Dashboard highlights setup shortcuts when family data is missing.

## 3. Dashboard

**Route:** `/dashboard`

The dashboard is your control center.

### What you see

- Welcome banner with your family name (when available).
- Summary cards:
  - Number of members
  - Number of accounts
  - Number of devices
  - Number of active incidents
- Risk score overview from your latest assessment.
- Quick actions to open key workflows.
- Immediate action suggestions.
- Recent activity (incidents and bookings).

### If your family is not set up yet

You will see a setup prompt with a **Create Family** action that takes you to `/family/new`.

## 4. Family Members

**Route:** `/family/members`

Use this page to maintain the people in your household.

### Add a member

1. Select **+ Add member**.
2. Complete the form:
  - Display name
  - Relationship (for example: Self, Spouse, Son, Daughter, Parent, Sibling)
  - Age group (Infant, Child, Teen, Adult, Senior)
  - Primary ecosystem (Google, Apple, Microsoft/Windows, Android, Mixed, Other)
  - Primary contact (yes/no)
3. Save.

### Edit a member

1. Find the person in the list.
2. Select **Edit**.
3. Update fields and save.

### Archive a member

1. Select **Archive** on the member row/card.
2. Confirm the action.

Archived members are hidden from the main list but historical records remain intact.

## 5. Accounts

**Route:** `/accounts`

Track important family accounts and security posture.

### What you can do

- Add account records.
- Edit existing records.
- Archive records no longer in use.
- Filter and search accounts.

### Add an account

1. Select **+ Add account**.
2. Enter account details (type, identifier, linked family member, security posture fields, notes).
3. Save.

### Use filters

- Filter by family member.
- Filter by account type.
- Search by identifier or notes.
- Use **Clear filters** to reset view.

### Security indicators you will see

- 2FA status
- Recovery email status
- Recovery phone status
- Suspicious activity flag

These indicators help prioritize what to improve first.

## 6. Devices

**Route:** `/devices`

Track family devices and key hardening settings.

### What you can do

- Add, edit, and archive devices.
- Filter by member, device type, and support status.
- Search devices by brand/model/OS.

### Device security fields

For each device, SafeFamily can track:

- Screen lock enabled
- Biometric enabled
- Backup enabled
- Find My Device enabled
- OS support status

Support status helps identify end-of-life devices that should be upgraded or replaced.

## 7. Digital Safety Assessment

### Start page

**Route:** `/assessment`

This page explains the assessment and includes the main call to action:

- **Start assessment** opens `/assessment/wizard`.
- If a previous assessment exists, you can open latest result directly.

### Assessment wizard

**Route:** `/assessment/wizard`

The wizard is category-based and step-by-step.

Categories include:

- Account Security
- Device Hygiene
- Backup & Recovery
- Privacy & Sharing
- Scam Readiness

How to complete:

1. Answer all questions on the current step.
2. Select **Next** to continue.
3. Use **Back** to review previous answers.
4. On the last step, select **Submit assessment**.

### Result page

**Route:** `/assessment/result`

Shows:

- Overall score (0-100)
- Risk level label
- Category-by-category score bars
- Immediate action recommendations

If no assessment exists yet, this page prompts you to start one.

### History page

**Route:** `/assessment/history`

Use this page to compare previous runs over time.

Actions available:

- Open latest result
- Retake assessment

## 8. Checklist

**Route:** `/checklists`

Checklist gives practical actions to reduce risk.

### What you can do

- View summary stats.
- Filter by priority.
- Filter by status.
- Filter by category.
- Search by title/description.

Use checklist routinely after assessments and incident events to keep improvements on track.

## 9. Incidents

### Incident list

**Route:** `/incidents`

Use this page to review all incidents and start new reports.

From here you can:

- Select **Report Incident** to open `/incidents/report`.
- Open any incident card for full details.

### Report incident form

**Route:** `/incidents/report`

Steps:

1. Select incident type (for example phishing, password compromise, malware, data breach, scam/fraud, identity theft, social engineering, or other).
2. Choose severity (Low, Medium, High, Critical).
3. Enter a clear summary (minimum 10 characters).
4. Submit.

After submission, you are redirected to result page for that incident.

### Incident action plan

**Route:** `/incidents/result/:id`

This page confirms the incident was saved and provides:

- Incident summary
- Severity and status badges
- Recommended first action plan
- Shortcuts to book support, open checklist, report another incident

### Incident details

**Route:** `/incidents/:id`

Use this page to revisit full details and action plan for an existing incident.

## 10. Bookings

### Create booking

**Route:** `/bookings`

Book a safety support session in 4 steps:

1. Choose service package.
2. Select preferred date and time.
3. Choose channel:
  - Online (video)
  - Phone
  - Email
  - Onsite
4. Add optional notes, then submit.

You are redirected to the booking details page after creation.

### My bookings

**Route:** `/bookings/my`

Shows upcoming and past bookings with:

- Package name
- Preferred date/time
- Channel
- Booking status
- Payment status

### Booking details

**Route:** `/bookings/:id`

Shows full booking information and context-aware actions (for example follow-up booking when completed).

## 11. Reports

**Route:** `/reports`

Reports brings assessment and incident outputs into one place.

### What you can do

- View high-level report metrics.
- Filter reports by type and date range.
- Search by title/description/context.
- Select a report to preview details in the side panel.

Useful for tracking progress and sharing safety snapshots.

## 12. Settings

**Route:** `/settings`

Settings includes multiple tabs:

- **Profile**: update personal info.
- **Security**: update password/security controls.
- **Notifications**: manage email notifications, booking updates, and incident alerts.
- **Privacy**: review privacy preferences.
- **Danger Zone**: request permanent account deletion.

### Account deletion flow (Danger Zone)

To request deletion, type the exact confirmation word `DELETE` and submit.

Important: deletion request is irreversible and includes family data, assessments, incidents, and booking history.

## 13. Admin Panel (Admin Role Only)

Admin routes are available only to users with Admin role.

### Admin Dashboard

**Route:** `/admin`

Shows:

- Platform totals (users, families, bookings, incidents)
- Pending/open operational counts
- Recent activity entries
- Quick links to major admin workflows

### Users

**Route:** `/admin/users`

Use this page to manage platform users.

What you can do:

- Search users
- Filter by role
- Filter by status
- Filter by email verification status
- Open a user profile for more details

### User Detail

**Route:** `/admin/users/:id`

Use this page to review and manage one user account.

What you can see and do:

- Profile details (email, display name, phone)
- Account metadata (role, status, verified status, joined date, last login)
- Linked family info when available
- Admin actions for account operations

### Customers

**Route:** `/admin/customers`

Use this page to manage family-level customers.

What you can do:

- Search customers
- Filter by risk level
- Filter by plan type
- Open full customer detail view

### Customer Detail

**Route:** `/admin/customers/:familyId`

Use this page for a 360-degree view of one customer family.

Tabs and tools include:

- Overview: owner profile, members, assessment summary, checklist status
- Security: account and device security posture
- Activity: incidents, bookings, reports timeline
- Notes: internal customer notes panel

### Admin Bookings

**Route:** `/admin/bookings`

View all bookings and manage operational status updates.

### Admin Incidents

**Route:** `/admin/incidents`

View all incidents and update incident status directly.

### Admin Reports

**Route:** `/admin/reports`

Review all generated reports across families.

What you can do:

- Filter by report type and date range
- Search by title/summary
- Open a report detail panel for deeper review

### Service Packages

**Route:** `/admin/packages`

Manage bookable service packages.

What you can do:

- Create new package
- Edit title, description, price, duration, and visibility
- Activate or deactivate packages

### Internal Notes

**Route:** `/admin/notes`

Create and review internal admin notes linked to families, bookings, or incidents.

### System Activity (Audit Log)

**Route:** `/admin/activity`

Review system activity with filters.

What you can do:

- Filter by activity type
- Filter by date range
- Review actor, entity, summary, and event time

### Legacy Audit Log Route

**Route:** `/admin/audit-log`

This route is still available for compatibility. Use `/admin/activity` for the full experience.

## 14. Quick Route Reference

| Route | Purpose | Access |
|---|---|---|
| `/` | Home page | Public |
| `/login` | Sign in | Guest only |
| `/register` | Create account | Guest only |
| `/dashboard` | Main dashboard | Authenticated |
| `/family/new` | Create family profile | Authenticated |
| `/family/members` | Manage family members | Authenticated |
| `/accounts` | Manage account records | Authenticated |
| `/devices` | Manage device records | Authenticated |
| `/assessment` | Assessment overview/start | Authenticated |
| `/assessment/wizard` | Multi-step assessment form | Authenticated |
| `/assessment/result` | Latest assessment result | Authenticated |
| `/assessment/history` | Past assessment runs | Authenticated |
| `/checklists` | Action checklist | Authenticated |
| `/incidents` | Incident list | Authenticated |
| `/incidents/report` | New incident form | Authenticated |
| `/incidents/result/:id` | Incident action plan | Authenticated |
| `/incidents/:id` | Incident details | Authenticated |
| `/bookings` | Book support session | Authenticated |
| `/bookings/my` | View your bookings | Authenticated |
| `/bookings/:id` | Booking details | Authenticated |
| `/reports` | Reports and preview | Authenticated |
| `/settings` | Account and privacy settings | Authenticated |
| `/admin` | Admin dashboard | Admin only |
| `/admin/users` | User management view | Admin only |
| `/admin/users/:id` | User detail and actions | Admin only |
| `/admin/customers` | Customer management view | Admin only |
| `/admin/customers/:familyId` | Family customer detail view | Admin only |
| `/admin/bookings` | Booking operations view | Admin only |
| `/admin/incidents` | Incident operations view | Admin only |
| `/admin/reports` | Reports operations view | Admin only |
| `/admin/packages` | Service package management | Admin only |
| `/admin/notes` | Internal notes workspace | Admin only |
| `/admin/activity` | System activity / audit log view | Admin only |
| `/admin/audit-log` | Legacy audit log route | Admin only |
