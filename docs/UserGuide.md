# SafeFamily — User Guide

> SafeFamily helps your family track, assess, and improve your digital safety — all in one place.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Set Up Your Family](#2-set-up-your-family)
3. [Manage Family Members](#3-manage-family-members)
4. [Track Digital Accounts](#4-track-digital-accounts)
5. [Track Devices](#5-track-devices)
6. [Run a Digital Safety Assessment](#6-run-a-digital-safety-assessment)
7. [Work Through Your Security Checklist](#7-work-through-your-security-checklist)
8. [Report a Security Incident](#8-report-a-security-incident)
9. [Book a Professional Safety Session](#9-book-a-professional-safety-session)
10. [Admin Panel (Admins Only)](#10-admin-panel-admins-only)
11. [Quick Reference](#11-quick-reference)

---

## 1. Getting Started

### Create your account

1. Click **Sign up** in the top-right corner of the home page, or go directly to `/register`.
2. Fill in:
   - **Email address** — your login identifier
   - **Display name** — how your name appears in the app
   - **Password** — at least 8 characters
3. Click **Create account**. You'll be taken to your dashboard automatically.

### Sign in to an existing account

Go to `/login`, enter your email and password, and click **Sign in**.

> **Already signed in?** Visiting `/login` will redirect you straight to your dashboard.

---

## 2. Set Up Your Family

**This step is required before you can use any other feature.**

When you sign up for the first time, you'll be prompted to create your family profile.

1. You'll see a **"Create your family"** form.
2. Fill in:
   - **Family name** — e.g. "The Nguyens"
   - **Country** — your country (2-letter code, e.g. `AU`, `US`, `VN`)
   - **Timezone** — your local timezone
3. Click **Save**. You'll be taken to your dashboard.

> If you ever navigate to a protected page without a family set up, you'll be redirected back to this setup step.

---

## 3. Manage Family Members

**Go to:** `/family/members`

Add the people in your household so you can track accounts and devices on their behalf.

### Add a member

1. Click **+ Add member** in the top-right corner.
2. Fill in:
   - **Name** — the person's display name
   - **Relationship** — e.g. Partner, Child, Parent
   - **Age group** — e.g. Adult, Teen, Child
   - **Primary ecosystem** — their main device platform (e.g. Apple, Android, Windows)
   - **Primary contact** — toggle on if this person is the main point of contact
3. Click **Save**.

### Edit a member

Click **Edit** on any row in the member list to update their details.

### Remove a member

Click **Archive** on a member's row. They'll be hidden from the list but their historical data is preserved.

---

## 4. Track Digital Accounts

**Go to:** `/accounts`

Keep a record of your family's online accounts and monitor their security health.

### Add an account

1. Click **+ Add account**.
2. Fill in:
   - **Account type** — e.g. Email, Banking, Social Media
   - **Identifier** — a masked identifier like `j***@gmail.com` (do not enter full credentials)
   - **Family member** — which member this account belongs to *(optional)*
   - **Two-factor authentication** — Enabled / Disabled / Unknown
   - **Recovery email** — whether a recovery email is set up
   - **Recovery phone** — whether a recovery phone is set up
   - **Suspicious activity** — flag if the account has shown any suspicious signs
   - **Notes** — any additional context
3. Click **Save**.

### What the status badges mean

| Badge | Meaning |
|-------|---------|
| 🟢 Enabled / Set | Security feature is active — good |
| 🔴 Disabled / Not set | Security feature is missing — action needed |
| ⚪ Unknown | Status hasn't been checked yet |

### Edit or delete an account

Use the **Edit** and **Delete** buttons on each account row.

---

## 5. Track Devices

**Go to:** `/devices`

Log all computers, phones, and tablets your family uses and check their security configuration.

### Add a device

1. Click **+ Add device**.
2. Fill in:
   - **Device type** — e.g. Laptop, Smartphone, Tablet
   - **Brand and model** — e.g. Apple MacBook Pro
   - **OS name and version** — e.g. macOS 14.4
   - **Support status** — whether the OS still receives security updates
   - **Family member** — which member owns this device *(optional)*
   - **Security features** — toggle each one:
     - Screen lock enabled
     - Biometric authentication enabled
     - Backup enabled
     - Find My Device enabled
   - **Notes** — any additional context
3. Click **Save**.

### Support status colours

| Status | Meaning |
|--------|---------|
| 🟢 Supported | Still receiving security updates |
| 🔴 End of life | No longer supported — replace or upgrade |
| 🟡 No updates | Updates have stopped — consider upgrading |

---

## 6. Run a Digital Safety Assessment

**Go to:** `/assessment`

Answer 22 questions to get a personalised risk score for your family across five security areas.

### How it works

1. Go to `/assessment` and click **Start assessment**.
2. Answer questions in each category:
   - 🔐 **Account Security** — passwords, 2FA, recovery options
   - 💻 **Device Hygiene** — OS updates, screen locks, encryption
   - ☁️ **Backup & Recovery** — cloud backups, local copies
   - 👁️ **Privacy & Sharing** — what you share online and with whom
   - 🎣 **Scam Readiness** — ability to identify phishing and fraud
3. Click **Submit**. You'll see your result immediately.

### Understanding your result

- **Overall score (0–100)** — higher is safer
- **Risk level** — Low (green) / Medium (amber) / High (orange) / Critical (red)
- **Per-category breakdown** — a bar for each of the five categories showing where you're strong and where you need work

### View a previous result

If you've already done an assessment, a **"View your last result →"** link appears on the assessment start page.

### After the assessment

Your result automatically generates a personalised **security checklist** — see the next section.

---

## 7. Work Through Your Security Checklist

The checklist is generated from your assessment results and your registered accounts and devices. It gives you concrete actions to improve your family's security.

> Access the checklist from the **assessment result page** or navigate directly via your dashboard.

### Each checklist item shows:
- **Title and description** — what to do and why
- **Category** — which security area it belongs to
- **Priority** — how urgent the action is

### Updating an item's status

Click on an item to mark it as:
- **Done** — you've completed this action
- **Dismissed** — not applicable to your situation

Focus on high-priority items first, particularly anything in Account Security or Devices that shows red status badges.

---

## 8. Report a Security Incident

**Go to:** `/incidents`

Log a security event that has affected your family — like a phishing email, a compromised account, or malware on a device.

### Report a new incident

1. Go to `/incidents` and you'll see a grid of incident types. Select the one that best describes what happened:
   - Phishing / Scam
   - Account Compromise
   - Malware / Ransomware
   - Data Breach
   - Device Theft / Loss
   - Fraud
   - Cyberbullying
   - Unsolicited Contact
   - And more…

2. A form will appear asking for details about the incident — fill in what you know.

3. Submit to see your **Incident Action Plan** — a step-by-step guide for containing and recovering from the incident.

### After reporting

Your incident is saved so you can refer back to the action plan at any time. Go to `/incidents` to see all reported incidents and their current status (Open, In Progress, Resolved, Dismissed).

---

## 9. Book a Professional Safety Session

**Go to:** `/bookings`

If you need expert help, you can book a professional digital-safety consultation.

### Book a session

1. Go to `/bookings`. You'll see available service packages — click a package to select it.
2. Choose:
   - **Preferred date and time**
   - **Contact method** — Online, Phone, or Email
   - **Notes** *(optional)* — anything specific you'd like to discuss
3. Click **Book session**. You'll be redirected to your bookings list.

### View your bookings

Go to `/bookings/my` to see all upcoming and past sessions with:
- Package name
- Contact method and date
- Payment status (Pending / Paid / Refunded / Waived)

From here you can also click **Book a Session** to make another booking.

---

## 10. Admin Panel (Admins Only)

If your account has been granted the **Admin** role, you'll have access to platform-wide management tools.

> Regular users cannot access these pages — they'll be redirected to the dashboard.

### Admin Dashboard — `/admin`

Overview of the entire platform:
- Total users, families, bookings, and incidents
- Pending bookings count
- Open incidents count
- Recent audit log (who did what and when)

### Customers — `/admin/customers`

View all registered users across the platform.

### Bookings Management — `/admin/bookings`

View all bookings from all families. Update a booking's **payment status** (Pending → Paid / Refunded / Waived) once a session is confirmed or completed.

### Incidents Management — `/admin/incidents`

View all reported incidents from all families. Update an incident's **status** (Open → In Progress → Resolved / Dismissed) as your team works through them.

---

## 11. Quick Reference

| URL | What's there | Who can access |
|-----|-------------|----------------|
| `/` | Home / landing page | Everyone |
| `/register` | Create a new account | Not logged in |
| `/login` | Sign in | Not logged in |
| `/dashboard` | Your personal dashboard | Logged in |
| `/family/new` | Create your family (first-time setup) | Logged in |
| `/family/members` | Add and manage family members | Logged in |
| `/accounts` | Track digital accounts | Logged in |
| `/devices` | Track family devices | Logged in |
| `/assessment` | Start a digital safety assessment | Logged in |
| `/assessment/wizard` | Assessment questions | Logged in |
| `/assessment/result` | View your latest assessment result | Logged in |
| `/incidents` | Select an incident type to report | Logged in |
| `/incidents/report` | Report an incident | Logged in |
| `/bookings` | Book a professional safety session | Logged in |
| `/bookings/my` | View your bookings | Logged in |
| `/admin` | Admin overview + audit log | Admin only |
| `/admin/customers` | All platform users | Admin only |
| `/admin/bookings` | All bookings + payment management | Admin only |
| `/admin/incidents` | All incidents + status management | Admin only |
