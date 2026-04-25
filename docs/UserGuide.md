# SafeFamily — User Guide

SafeFamily helps households organise family members, track digital risks, report incidents, and get personalised expert help to improve online safety — including adviser-prepared safety plans and recovery guides.

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [First-Time Setup Journey](#2-first-time-setup-journey)
3. [Dashboard](#3-dashboard)
4. [Family Members](#4-family-members)
5. [Accounts](#5-accounts)
6. [Devices](#6-devices)
7. [Digital Safety Assessment](#7-digital-safety-assessment)
8. [Checklist](#8-checklist)
9. [Safety Tasks](#9-safety-tasks)
10. [Premium Checklist](#10-premium-checklist)
11. [Incidents](#11-incidents)
12. [Bookings & Service Packages](#12-bookings--service-packages)
13. [Family Safety Plan](#13-family-safety-plan)
14. [Incident Recovery Pack](#14-incident-recovery-pack)
15. [Reports](#15-reports)
16. [Settings](#16-settings)
17. [Admin Panel (Admin Role Only)](#17-admin-panel-admin-role-only)
18. [Feature Flow Overview](#18-feature-flow-overview)
19. [Quick Route Reference](#19-quick-route-reference)

## 1. Getting Started

### Create your account

1. Open `/register`.
2. Enter your email address.
3. Enter your display name.
4. Enter a password (minimum 8 characters).
5. Select **Create account**.

After account creation you are signed in and taken to your dashboard.

### Sign in to an existing account

1. Open `/login`.
2. Enter your email and password.
3. Select **Sign in**.

If you tried to open a protected page first, SafeFamily returns you to that page after a successful login.

### Guest-only pages

`/login` and `/register` are guest-only pages. If you are already signed in, opening these pages redirects you to `/dashboard`.

## 2. First-Time Setup Journey

Complete these steps in order — each one unlocks more useful information in later features.

| Step | Action | Route |
|------|--------|-------|
| 1 | Create your account | `/register` |
| 2 | Create your family profile | `/family/new` |
| 3 | Add family members | `/family/members` |
| 4 | Add digital accounts | `/accounts` |
| 5 | Add family devices | `/devices` |
| 6 | Run your first assessment | `/assessment/wizard` |
| 7 | Review your checklist | `/checklists` |
| 8 | Review your safety tasks | `/tasks` |

**Why the order matters:**

- The **family profile** is foundational. Accounts, devices, members, and safety tasks all attach to it.
- The **assessment** uses your accounts and devices to calculate risk scores and generate a personalised checklist and safety tasks.
- **Safety tasks** are automatically generated based on assessment answers, accounts, and devices — the more complete your data, the more specific your tasks.
- The **dashboard** shows setup prompt cards when any of these steps are missing.

## 3. Dashboard

**Route:** `/dashboard`

The dashboard is your control centre. It gives a real-time view of your family's digital safety posture and surfaces the actions that matter most.

### What you see

- **Welcome banner** — shows your family name and a quick status message. If you have not created a family yet, it shows a **Create Family** button instead.
- **Summary cards** — Members, Accounts, Devices, and Active Incidents counts.
- **Risk score card** — your latest assessment overall score (0–100) and risk level label.
- **Annual Plan card** — if you have an active Annual Safety Plan, shows your next quarterly review date and a link to your plan.
- **Quick actions** — shortcuts to key workflows (run assessment, add a device, report an incident, book support).
- **Immediate action suggestions** — the highest-priority safety tasks that need your attention right now.
- **Recent activity** — the last few incident and booking updates for your family.

### If your family is not set up yet

You will see a setup prompt card. Select **Create Family** to go to `/family/new`.

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

## 9. Safety Tasks

**Route:** `/tasks`

Safety tasks are automatically generated, actionable to-do items derived from your assessment answers, registered accounts, and connected devices. They are the primary way to work through your family's safety improvements one step at a time.

### How tasks are generated

Tasks are created or refreshed when:

- You complete or retake an assessment.
- You add a new account or device.
- A family adviser processes a service package (Annual Safety Plan, Family Safety Plan).
- Nightly background jobs run for families on an Annual Plan.

The more complete your family profile, the more specific and relevant your tasks will be.

### Task structure

Each task shows:

| Field | Description |
|-------|-------------|
| **Title** | Short action label |
| **Description** | What to do and why |
| **Category** | e.g. AccountSecurity, DeviceHygiene, BackupRecovery, PrivacySharing, ScamReadiness |
| **Priority** | Critical, High, Medium, or Low |
| **Phase** | When to act: Immediate, Next7Days, Next30Days, Ongoing, Recurring |
| **Status** | NotStarted, InProgress, Completed, Snoozed, Dismissed |
| **Why** | Context explaining why this task was generated |
| **Guidance** | Detailed step-by-step instructions |

### Task statuses

| Status | Meaning |
|--------|---------|
| **NotStarted** | Default — task not yet acted on |
| **InProgress** | You have started but not finished |
| **Completed** | Marked done |
| **Snoozed** | Deferred — hidden for a set period |
| **Dismissed** | Not relevant — removed from your active list |

### Filter and search

Use the filter bar at the top of `/tasks` to narrow the list:

- **Status** — filter to only show tasks at a given status
- **Priority** — filter by Critical / High / Medium / Low
- **Phase** — filter by when the task should happen
- **Category** — filter by task type
- **Search** — free-text search across title and description

### Summary cards

Four summary cards at the top of the page give you an at-a-glance count:

- **Total tasks** — all active items
- **Completed** — tasks marked done
- **Critical remaining** — unfinished Critical-priority tasks
- **High remaining** — unfinished High-priority tasks

## 10. Premium Checklist

**Route:** `/checklist`

The Premium Checklist is an enhanced view of your checklist that groups tasks by phase, so you can work through them in the right order. It is available to families with a **Premium Checklist Access** or **Family Safety Plan Access** entitlement.

### Access requirement

| Entitlement | How to get it |
|-------------|---------------|
| `PremiumChecklistAccess` | Included in the Family Core and higher service packages |
| `FamilySafetyPlanAccess` | Included when adviser delivers a Family Safety Plan |

If you do not have either entitlement, the page shows an **Upgrade required** prompt with a button to book the relevant service.

### How it differs from Safety Tasks (`/tasks`)

| | Safety Tasks (`/tasks`) | Premium Checklist (`/checklist`) |
|-|------------------------|----------------------------------|
| **Access** | All authenticated users | Premium entitlement required |
| **View** | Flat list with filters | Grouped by phase |
| **Source** | All auto-generated tasks | Same tasks, curated view |
| **Best for** | Working through individual items | Planning the overall safety journey |

### Phase groups (in display order)

1. **Immediate** — act today
2. **Next 7 Days** — act this week
3. **Next 30 Days** — act this month
4. **Ongoing** — maintain regularly
5. **Recurring** — scheduled repeating actions

Each group shows a completion progress bar and can be expanded or collapsed.

## 11. Incidents

### Incident list

**Route:** `/incidents`

Use this page to review all incidents and start new reports.

From here you can:

- Select **Report Incident** to open `/incidents/report`.
- Open any incident card for full details.

### Report incident form

**Route:** `/incidents/report`

Steps:

1. Select incident type from the table below.
2. Choose severity.
3. Enter a clear summary (minimum 10 characters).
4. Submit.

After submission you are redirected to the result page for that incident.

#### Incident types

| Type | Description |
|------|-------------|
| **Phishing** | Suspicious email, text, or call attempting to steal credentials |
| **PasswordCompromise** | Account password known or suspected to be exposed |
| **UnauthorisedAccess** | Account or device accessed by someone without permission |
| **MalwareInfection** | Device infected with malicious software |
| **DataBreach** | Personal information exposed in a third-party breach |
| **ScamFraud** | Financial scam or fraudulent transaction |
| **IdentityTheft** | Personal identity documents or details stolen or misused |
| **SocialEngineering** | Manipulation to reveal information or perform actions |
| **DeviceLostStolen** | Device lost or stolen |
| **Other** | Any other digital safety incident |

#### Severity levels

| Level | Meaning |
|-------|---------|
| **Low** | Minor impact, no immediate action required |
| **Medium** | Moderate impact, action recommended soon |
| **High** | Significant impact, action required promptly |
| **Critical** | Severe impact, act immediately |

### Incident action plan

**Route:** `/incidents/result/:id`

This page confirms the incident was saved and provides:

- Incident summary
- Severity and status badges
- Recommended first action plan
- Shortcut to book support, open checklist, or report another incident
- If you have an **Incident Recovery Pack Access** entitlement, a link to your recovery pack at `/plans/incident-recovery`

### Incident details

**Route:** `/incidents/:id`

Use this page to revisit full details and action plan for an existing incident.

## 12. Bookings & Service Packages

### Available service packages

| Package Code | Name | Price | Key features unlocked |
|--------------|------|-------|----------------------|
| `FREE-CHECK` | Free Safety Check | Free | Basic consultation, checklist review |
| `FAMILY-CORE` | Family Core | Paid | Premium Checklist access, Family Safety Plan |
| `INCIDENT-RESP` | Incident Response | Paid | Incident Recovery Pack, priority support |
| `ANNUAL-PLAN` | Annual Safety Plan | Paid | All features, quarterly adviser reviews, recurring task refresh |

### Create a booking

**Route:** `/bookings`

Book support in four steps:

1. **Select a service package** — choose from the available packages above.
2. **Select a help topic** — pick the category best matching your need.
3. **Set urgency** — Routine, Urgent, or Critical.
4. **Add details (optional)** — any extra context for your adviser.
5. Select **Submit booking**.

**Free packages** are confirmed automatically and you go straight to the unlock page.

**Paid packages** create a pending booking. You are taken to the booking details page where you can pay.

### Pay for a booking

From the booking details page (`/bookings/:id`), select **Pay now**.

You are redirected to the secure payment gateway. After payment:

- **Payment successful** — you are returned to `/bookings/payment/success`, which syncs payment status and then takes you to `/bookings/:id/unlocked`.
- **Payment cancelled** — you are returned to `/bookings/payment/cancel`, which takes you back to the booking details page.

If a previous payment link has expired, the page shows a **Retry payment** button that generates a new link.

### Post-payment unlock page

**Route:** `/bookings/:id/unlocked`

This page confirms your booking is active and shows exactly what you have unlocked. Content varies by package:

| Package | Deliverables shown | Next steps |
|---------|-------------------|------------|
| `FREE-CHECK` | Checklist access, consultation notes | Open checklist, book follow-up |
| `FAMILY-CORE` | Family Safety Plan, premium checklist | View safety plan, open checklist |
| `INCIDENT-RESP` | Incident Recovery Pack | Open recovery pack, view tasks |
| `ANNUAL-PLAN` | Annual plan, all premium features, quarterly reviews | View safety plan, open checklist, view tasks |

### My bookings

**Route:** `/bookings/my`

Shows all your bookings with status, payment status, and inline payment actions.

From here you can:

- Select **Pay now** on any pending-payment booking.
- Select **Retry payment** if a previous attempt expired.
- Open any booking for full details.

### Booking details

**Route:** `/bookings/:id`

Shows:

- Package name, help topic, urgency, and optional details
- **Delivery status badge** — Pending, InProgress, Delivered, or Cancelled
- **Event timeline** — every status change with timestamp
- Payment strip (if applicable) — current payment status and Pay now / Retry actions

## 13. Family Safety Plan

**Route:** `/plans/safety`

The Family Safety Plan is a personalised digital safety strategy prepared by a SafeFamily adviser after you book a **Family Core** or **Annual Safety Plan** package. It gives your family a structured view of risks and the actions to address them.

### Access requirement

Requires the `FamilySafetyPlanAccess` entitlement, which is delivered when an adviser completes your booking.

If you do not have this entitlement, the page shows how to book the relevant service.

### What the plan contains

- **Risk overview** — overall family risk level and score
- **Top risks** — ranked list of highest-risk areas
- **Top priorities** — the adviser's recommended focus areas
- **Action plan by member** — specific actions for each family member
- **Action plan by device** — specific actions for each registered device

### How it connects to other features

- The plan automatically generates safety tasks visible at `/tasks` and `/checklist`.
- Tasks created by the plan are labelled with source type `FamilySafetyPlan`.
- Completing tasks updates the plan's progress.

### Download report

Select **Download report** to export the plan as a PDF for offline reference or sharing.

### Annual Plan refresh

If you are on an Annual Safety Plan, your adviser will update the Family Safety Plan at each quarterly review. Tasks are refreshed accordingly.

## 14. Incident Recovery Pack

**Route:** `/plans/incident-recovery`

The Incident Recovery Pack is a structured response guide prepared by a SafeFamily adviser when you book an **Incident Response** package. It tells you exactly what to do in the first hours and days after a digital safety incident.

### Access requirement

Requires the `IncidentRecoveryPackAccess` entitlement, delivered when an adviser completes your incident response booking.

If you do not have this entitlement, the page prompts you to book the Incident Response package.

### Pack structure

The pack is divided into five sections:

| Section | Contents |
|---------|----------|
| **What happened** | Summary of what occurred, how, and what was affected |
| **Immediate actions** | Steps to take right now to stop further damage |
| **What NOT to do** | Common mistakes that could make things worse |
| **Next 24 hours** | Actions to complete within the first day |
| **Next 7 days** | Longer recovery steps for the following week |

### How it connects to other features

- Recovery tasks are generated and appear in your Safety Tasks list (`/tasks`), labelled with source type `IncidentRecoveryPack`.
- Each section's tasks are assigned the corresponding phase so they appear in the correct group in the Premium Checklist (`/checklist`).

### Status badge

The pack shows one of three statuses:

| Status | Meaning |
|--------|---------|
| **Active** | Current recovery pack in use |
| **Superseded** | Replaced by a newer pack (for example after a follow-up booking) |
| **Archived** | Older pack retained for reference |

## 15. Reports

**Route:** `/reports`

Reports brings assessment and incident outputs into one place.

### What you can do

- View high-level report metrics.
- Filter reports by type and date range.
- Search by title, description, or context.
- Select a report to preview details in the side panel.

Useful for tracking progress and sharing safety snapshots.

## 16. Settings

**Route:** `/settings`

Settings includes multiple tabs:

- **Profile**: update personal info.
- **Security**: update password and security controls.
- **Notifications**: manage email notifications, booking updates, and incident alerts.
- **Privacy**: review privacy preferences.
- **Danger Zone**: request permanent account deletion.

### Account deletion flow (Danger Zone)

To request deletion, type the exact confirmation word `DELETE` and submit.

Important: deletion is irreversible and removes all family data, assessments, incidents, and booking history.

## 17. Admin Panel (Admin Role Only)

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

## 18. Feature Flow Overview

### Core data flow

```
Register / Sign in
       |
  Create Family
       |
  Add Members ─── Add Accounts ─── Add Devices
       |                |                |
       └────────────────┴────────────────┘
                        |
             Run Assessment (wizard)
                        |
         ┌──────────────┼──────────────┐
         |              |              |
      Checklist   Safety Tasks    Reports
    (/checklists)   (/tasks)      (/reports)
```

### Booking → features unlocked flow

```
Book a package (/bookings)
       |
  ┌────┴────┐
Free?     Paid?
  |          |
Confirm    Pay now → gateway → callback
  |                                |
  |                         ┌──── paid? ────┐
  |                         Yes             No
  |                         |               |
  └─────────────── Unlock page (/bookings/:id/unlocked)
                            |
          ┌─────────────────┼─────────────────┐
          |                 |                  |
   Family Safety Plan  Incident Recovery  Annual Plan
   (/plans/safety)     (/plans/incident-recovery)
          |                 |
   Tasks generated    Tasks generated
   in /tasks and      in /tasks and
   /checklist         /checklist
```

### Assessment → tasks relationship

```
Assessment submitted
       |
  Score calculated per category
       |
  Tasks generated or refreshed
  (existing tasks updated, new gaps create new tasks)
       |
  Visible at /tasks and /checklist
       |
  Retake assessment → tasks refreshed again
```

### Annual Plan → recurring tasks

```
Annual Plan active
       |
  Nightly background job runs
       |
  Recurring tasks re-created or refreshed
  (phase = Recurring, source = AnnualPlan)
       |
  Quarterly adviser review
       |
  Family Safety Plan updated
  → New tasks generated

## 19. Quick Route Reference

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
| `/assessment` | Assessment overview / start | Authenticated |
| `/assessment/wizard` | Multi-step assessment form | Authenticated |
| `/assessment/result` | Latest assessment result | Authenticated |
| `/assessment/history` | Past assessment runs | Authenticated |
| `/checklists` | Action checklist | Authenticated |
| `/tasks` | Safety tasks list | Authenticated |
| `/checklist` | Premium checklist (phase-grouped) | Premium entitlement required |
| `/incidents` | Incident list | Authenticated |
| `/incidents/report` | New incident form | Authenticated |
| `/incidents/result/:id` | Incident action plan | Authenticated |
| `/incidents/:id` | Incident details | Authenticated |
| `/bookings` | Book a service package | Authenticated |
| `/bookings/my` | View your bookings | Authenticated |
| `/bookings/:id` | Booking details | Authenticated |
| `/bookings/:id/unlocked` | Post-payment confirmation | Authenticated |
| `/bookings/payment/success` | Payment success callback | Authenticated |
| `/bookings/payment/cancel` | Payment cancel callback | Authenticated |
| `/plans/safety` | Family Safety Plan | FamilySafetyPlanAccess entitlement |
| `/plans/incident-recovery` | Incident Recovery Pack | IncidentRecoveryPackAccess entitlement |
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
