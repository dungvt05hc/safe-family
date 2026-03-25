---
name: webapp-user-guide
description: "Generate a user-facing guideline document for this web app. Use when asked to: create a user guide, write end-user documentation, explain how to use the app, document features for non-technical users, or produce onboarding instructions. Analyzes routes, page components, and feature structure to generate accurate step-by-step walkthroughs."
argument-hint: "Optional: scope to a specific feature (e.g. 'assessment flow', 'admin panel')"
---

# Web App User Guide Generator

## What This Skill Produces

A structured, user-facing guide document that explains how to use the SafeFamily web application — written for end users, not developers. Covers feature discovery, onboarding flow, role-based access, and a quick-reference navigation table.

## When to Use

- "Give me a user guide for this app"
- "How do I use this web app?"
- "Create end-user documentation"
- "What can I do on each page?"
- "Write onboarding instructions for new users"

---

## Procedure

### Step 1 — Discover All Routes

Read `apps/web/src/app/router.tsx` to extract:
- All route paths
- Which guard wraps each route (`ProtectedRoute`, `GuestRoute`, `AdminRoute`)
- The page component rendered at each path

Group routes into:
- **Public / Guest** — accessible without login
- **Authenticated** — requires login
- **Admin-only** — requires Admin role

### Step 2 — Understand Each Feature

For each page component found in the router, read the corresponding `.tsx` file under:
- `apps/web/src/features/<feature>/pages/`
- `apps/web/src/pages/`

Extract:
- What the page allows the user to do (read the component's visible content, buttons, forms)
- What data it shows or collects
- Any sequential steps or wizards (multi-step flows)

### Step 3 — Identify Onboarding Order

Determine the logical first-time-user journey by checking for:
- Redirect logic in `ProtectedRoute` or services (e.g. "no family → go to `/family/new`")
- Required setup steps before other features work (e.g. family must exist before accounts/devices)
- Feature dependencies identified in service files (`apps/web/src/features/<feature>/<feature>.service.ts`)

### Step 4 — Identify Role-Based Differences

Check `apps/web/src/features/admin/` for admin-only pages and note what additional capabilities admins have versus regular users.

### Step 5 — Write the Guide

Produce a user guide with this structure:

```
## Getting Started
1. Create your account (register)
2. First-time setup steps in required order

## Features
### [Feature Name]
- What it is (1-2 sentences)
- How to access it (URL or navigation path)
- Step-by-step instructions
- What you'll see / what to expect

## Admin Panel (if applicable)
- Who can access it
- What admin capabilities exist

## Quick Reference
| URL | What's there |
|-----|-------------|
| ... | ...          |
```

**Writing style rules:**
- Plain language — no technical jargon, no code
- Present tense, action-oriented ("Click", "Fill in", "Navigate to")
- Describe what the user *does*, not how the code works
- Mention the URL for each feature so users can navigate directly
- Group features into a logical user journey, not alphabetical order

### Step 6 — Validate Completeness

Before finishing, cross-check that every authenticated route from the router appears in the guide. Any route without a corresponding section is a gap.

---

## Output Format

Deliver the guide as clean Markdown — suitable to paste into a README, Notion page, or support doc. Do **not** include code blocks, technical terms, or architecture details.

If the user requested scope to a specific feature (via argument), generate only the section for that feature with full detail rather than the full app guide.
