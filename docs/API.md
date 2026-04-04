# SafeFamily — API Reference

> Version: April 4, 2026  
> Base URL (development): `http://localhost:5050`  
> Authentication: Cookie-based (`sf_session`, `HttpOnly`, `SameSite=Lax`)  
> Swagger UI: `GET /swagger` (Development only)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Family](#3-family)
4. [Accounts](#4-accounts)
5. [Devices](#5-devices)
6. [Device Catalog](#6-device-catalog)
7. [Assessments](#7-assessments)
8. [Checklists](#8-checklists)
9. [Incidents](#9-incidents)
10. [Reports](#10-reports)
11. [Bookings & Service Packages](#11-bookings--service-packages)
12. [Payments](#12-payments)
13. [Settings](#13-settings)
14. [Dashboard](#14-dashboard)
15. [Admin](#15-admin)
16. [Error Responses](#16-error-responses)
17. [Rate Limiting](#17-rate-limiting)

---

## 1. Overview

### Request Format

All request bodies must be `application/json`. All timestamps are ISO 8601 with UTC offset (`DateTimeOffset`).

### Response Format

All responses are `application/json` with camelCase property names. Successful responses return the documented schema directly (no wrapper object).

### Authentication

The API uses **cookie authentication**. After logging in, the browser automatically sends the `sf_session` cookie on every subsequent request. The cookie is `HttpOnly`, so JavaScript cannot read it.

For API clients that cannot use cookies (e.g. Swagger UI testing), a Bearer token option is available in the Swagger UI.

### Endpoint Groups

| Group | Base Path | Who can call |
|-------|-----------|--------------|
| Auth | `/api/auth/...` | Anyone |
| Family | `/api/families/...`, `/api/family-members/...` | Authenticated users |
| Accounts | `/api/accounts/...` | Authenticated users |
| Devices | `/api/devices/...` | Authenticated users |
| Device Catalog | `/api/device-catalog/...` | Authenticated users |
| Assessments | `/api/assessments/...` | Authenticated users |
| Checklists | `/api/checklists/...` | Authenticated users |
| Incidents | `/api/incidents/...` | Authenticated users |
| Reports | `/api/reports/...` | Authenticated users |
| Bookings | `/api/bookings/...`, `/api/service-packages` | Authenticated users |
| Payments | `/api/bookings/{id}/payment/...` | Authenticated users |
| Settings | `/api/settings/...` | Authenticated users |
| Dashboard | `/api/dashboard` | Authenticated users |
| Health | `/api/health` | Anyone |
| Admin | `/api/admin/...` | Admin role only |
| Webhooks | `/api/webhooks/...` | Payment gateways (HMAC-verified) |

---

## 2. Authentication

### POST /api/auth/register

Register a new user account. The session cookie is set automatically on success.

**Request**

```json
{
  "email": "user@example.com",
  "displayName": "Jane Smith",
  "password": "MySecurePass123"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email format, max 256 chars |
| `displayName` | string | Yes | Max 200 chars |
| `password` | string | Yes | Min 8 chars, max 100 chars |

**Response** — `201 Created`

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "displayName": "Jane Smith",
  "role": "User"
}
```

**Error responses:** `400 Bad Request` (validation), `409 Conflict` (email already registered)

---

### POST /api/auth/login

Log in to an existing account.

**Request**

```json
{
  "email": "user@example.com",
  "password": "MySecurePass123"
}
```

**Response** — `200 OK` — same shape as register.

**Error responses:** `400 Bad Request`, `401 Unauthorized` (invalid credentials)

---

### POST /api/auth/logout

Clears the session cookie. No request body required.

**Response** — `200 OK`

---

### GET /api/auth/me

Returns the currently authenticated user. Also refreshes session claims if the role or email has changed since last login.

**Response** — `200 OK` — same shape as register/login.

**Error responses:** `401 Unauthorized`

---

### GET /api/health

Returns a simple health check. No authentication required.

**Response** — `200 OK`

```json
{ "status": "Healthy" }
```

---

## 3. Family

All family endpoints require authentication. A user must belong to a family before accessing most other features. A user can have at most one active family.

### POST /api/families

Create a new family. Only one family per user is allowed.

**Request**

```json
{
  "displayName": "The Smith Family",
  "countryCode": "US",
  "timezone": "America/New_York"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `displayName` | string | Yes | Max 200 chars |
| `countryCode` | string | Yes | ISO 3166-1 alpha-2 (e.g. `"US"`, `"VN"`) |
| `timezone` | string | Yes | IANA timezone (e.g. `"America/New_York"`) |

**Response** — `201 Created`

```json
{
  "id": "...",
  "displayName": "The Smith Family",
  "countryCode": "US",
  "timezone": "America/New_York",
  "createdAt": "2026-04-04T10:00:00Z"
}
```

---

### GET /api/families/me

Returns the authenticated user's family.

**Response** — `200 OK` — same shape as above, plus a `members` array of `FamilyMemberResponse`.

---

### GET /api/family-members

List all members of the authenticated user's family.

**Response** — `200 OK`

```json
[
  {
    "id": "...",
    "familyId": "...",
    "displayName": "Jane",
    "relationship": "self",
    "ageGroup": "Adult",
    "primaryEcosystem": "apple",
    "isPrimaryContact": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### POST /api/family-members

Add a person to the family.

**Request**

```json
{
  "displayName": "Tom Smith",
  "relationship": "spouse",
  "ageGroup": "Adult",
  "primaryEcosystem": "google",
  "isPrimaryContact": false
}
```

| Field | Type | Allowed values |
|-------|------|---------------|
| `relationship` | string | `self`, `spouse`, `son`, `daughter`, `father`, `mother`, `grandfather`, `grandmother`, `sibling`, `relative`, `caregiver`, `other` |
| `ageGroup` | string (enum) | `Child`, `Teen`, `Adult`, `Senior` |
| `primaryEcosystem` | string | `google`, `apple`, `microsoft`, `android`, `mixed`, `other` |

**Response** — `201 Created` — `FamilyMemberResponse`

---

### PUT /api/family-members/{id}

Update an existing family member. Same request body as POST.

**Response** — `200 OK` — `FamilyMemberResponse`

---

### DELETE /api/family-members/{id}

Remove a member from the family.

**Response** — `204 No Content`

---

## 4. Accounts

Track digital accounts (email, banking, social, etc.) belonging to a family.

### GET /api/accounts

List accounts. Supports optional query filters.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `memberId` | GUID | Filter to a specific family member |
| `accountType` | string | Filter by account type |
| `search` | string | Free-text search on masked identifier and notes |

**Response** — `200 OK` — array of:

```json
{
  "id": "...",
  "familyId": "...",
  "memberId": "...",
  "accountType": "Email",
  "maskedIdentifier": "****@gmail.com",
  "twoFactorStatus": "Enabled",
  "recoveryEmailStatus": "Set",
  "recoveryPhoneStatus": "NotSet",
  "suspiciousActivityFlag": false,
  "notes": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

`accountType` values: `Email`, `Social`, `Banking`, `Shopping`, `Work`, `Gaming`, `Government`, `Health`, `Travel`, `Crypto`, `Other`

---

### GET /api/accounts/summary

Returns counts useful for the dashboard.

**Response** — `200 OK`

```json
{
  "total": 12,
  "without2Fa": 3,
  "missingRecoveryEmail": 5,
  "missingRecoveryPhone": 8,
  "suspicious": 1
}
```

---

### GET /api/accounts/{id}

Get a single account by ID.

**Response** — `200 OK` — `AccountResponse`

**Error responses:** `404 Not Found`, `403 Forbidden`

---

### POST /api/accounts

Create an account entry.

**Request**

```json
{
  "memberId": null,
  "accountType": "Email",
  "maskedIdentifier": "****@gmail.com",
  "twoFactorStatus": "Enabled",
  "recoveryEmailStatus": "Set",
  "recoveryPhoneStatus": "NotSet",
  "suspiciousActivityFlag": false,
  "notes": "Primary personal email"
}
```

> **Security note:** `maskedIdentifier` is a display label only. Never store passwords, OTPs, or secret credentials here.

**Response** — `201 Created` — `AccountResponse`

---

### PUT /api/accounts/{id}

Update an account. Same request body as POST.

**Response** — `200 OK` — `AccountResponse`

---

### DELETE /api/accounts/{id}

Soft-delete (archive) an account. The record is retained for audit purposes.

**Response** — `204 No Content`

---

## 5. Devices

Track family devices and their security posture.

### GET /api/devices

List devices. Supports optional query filters.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `memberId` | GUID | Filter to a specific family member |
| `deviceTypeCode` | string | e.g. `"smartphone"` |
| `supportStatus` | string | `Active`, `EndOfLife`, `Unknown` |
| `search` | string | Free-text search |

**Response** — `200 OK` — array of:

```json
{
  "id": "...",
  "familyId": "...",
  "memberId": "...",
  "deviceTypeCode": "smartphone",
  "deviceTypeName": "Smartphone",
  "brandCode": "apple",
  "brandName": "Apple",
  "modelCode": "iphone-15-pro",
  "modelName": "iPhone 15 Pro",
  "osFamilyCode": "ios",
  "osFamilyName": "iOS",
  "osVersionCode": "ios-18",
  "osVersionName": "iOS 18",
  "supportStatus": "Active",
  "screenLockEnabled": true,
  "biometricEnabled": true,
  "backupEnabled": true,
  "findMyDeviceEnabled": true,
  "notes": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### GET /api/devices/summary

Returns security posture counts.

**Response** — `200 OK`

```json
{
  "total": 8,
  "withoutScreenLock": 1,
  "withoutBackup": 2,
  "withoutBiometric": 0,
  "endOfLife": 1,
  "withoutFindMyDevice": 3
}
```

---

### GET /api/devices/{id}

Get a single device by ID.

**Response** — `200 OK` — `DeviceResponse`

---

### POST /api/devices

Register a device. Use the [Device Catalog](#6-device-catalog) endpoints first to get valid codes.

**Request**

```json
{
  "memberId": null,
  "deviceTypeCode": "smartphone",
  "brandCode": "apple",
  "modelCode": "iphone-15-pro",
  "osFamilyCode": "ios",
  "osVersionCode": "ios-18",
  "supportStatus": "Active",
  "screenLockEnabled": true,
  "biometricEnabled": true,
  "backupEnabled": true,
  "findMyDeviceEnabled": true,
  "notes": null
}
```

**Response** — `201 Created` — `DeviceResponse`

---

### PUT /api/devices/{id}

Update a device. Same request body as POST.

**Response** — `200 OK` — `DeviceResponse`

---

### DELETE /api/devices/{id}

Soft-delete (archive) a device.

**Response** — `204 No Content`

---

## 6. Device Catalog

Read-only reference data used to populate device registration forms. All endpoints require authentication.

### GET /api/device-catalog/form-options

Recommended: retrieve all dropdown data in one request. Supports optional filtering to narrow options for a specific selection.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `deviceTypeCode` | string | Narrow brands and models to this type |
| `brandCode` | string | Narrow models to this brand |
| `modelCode` | string | Include model's default OS family first |

**Response** — `200 OK`

```json
{
  "deviceTypes": [{ "id": "...", "code": "smartphone", "name": "Smartphone" }],
  "brands": [{ "id": "...", "code": "apple", "name": "Apple" }],
  "models": [{ "id": "...", "code": "iphone-15-pro", "name": "iPhone 15 Pro", "defaultOsFamilyId": "...", "defaultOsFamilyCode": "ios" }],
  "osFamilies": [{ "id": "...", "code": "ios", "name": "iOS" }],
  "osVersions": [{ "id": "...", "code": "ios-18", "name": "iOS 18" }]
}
```

---

### GET /api/device-catalog/device-types

All active device type categories.

**Response** — `200 OK` — array of `{ id, code, name }`

---

### GET /api/device-catalog/brands

All brands. Pass `?deviceTypeCode=smartphone` to filter.

**Response** — `200 OK` — array of `{ id, code, name }`

---

### GET /api/device-catalog/models

All models. Pass `?deviceTypeCode=...` and/or `?brandCode=...` to filter.

**Response** — `200 OK` — array of `{ id, code, name, defaultOsFamilyId, defaultOsFamilyCode }`

---

### GET /api/device-catalog/os-families

All OS families. Pass `?modelCode=...` to get the model's default OS first.

**Response** — `200 OK` — array of `{ id, code, name }`

---

### GET /api/device-catalog/os-versions

OS versions for a given family. `osFamilyCode` query param is **required**.

**Query params**

| Param | Type | Required |
|-------|------|----------|
| `osFamilyCode` | string | Yes |

**Response** — `200 OK` — array of `{ id, code, name }`

**Error responses:** `400 Bad Request` (missing `osFamilyCode`)

---

## 7. Assessments

Security assessment wizard that scores the family across five categories and generates an action plan.

### GET /api/assessments/questions

Returns the full question bank. No family requirement — safe to call before a family exists.

**Response** — `200 OK`

```json
[
  {
    "id": "q1",
    "category": "AccountSecurity",
    "text": "Do most of your accounts use a unique, strong password?",
    "options": [
      { "value": "all", "label": "Yes, all of them" },
      { "value": "most", "label": "Most of them" },
      { "value": "some", "label": "Some of them" },
      { "value": "none", "label": "No" }
    ],
    "isRequired": true
  }
]
```

Categories: `AccountSecurity`, `DeviceHygiene`, `BackupRecovery`, `PrivacySharing`, `ScamReadiness`

---

### POST /api/assessments

Submit a completed assessment. Requires a family.

**Request**

```json
{
  "answers": [
    { "questionId": "q1", "selectedValue": "most" },
    { "questionId": "q2", "selectedValue": "all" }
  ]
}
```

**Response** — `201 Created`

```json
{
  "id": "...",
  "familyId": "...",
  "overallScore": 72,
  "categoryScores": [
    { "category": "AccountSecurity", "score": 80 },
    { "category": "DeviceHygiene", "score": 65 }
  ],
  "riskLevel": "Medium",
  "immediateActions": [
    "Enable two-factor authentication on your primary email account.",
    "Set up a recovery phone number on critical accounts."
  ],
  "createdAt": "..."
}
```

`riskLevel` values: `Low`, `Medium`, `High`, `Critical`

---

### GET /api/assessments/latest

Returns the most recent assessment for the family.

**Response** — `200 OK` — `AssessmentResponse`

**Error responses:** `404 Not Found` (no assessment yet), `403 Forbidden` (no family)

---

### GET /api/assessments/history

Returns all assessments ordered from newest to oldest.

**Response** — `200 OK` — array of `AssessmentResponse`

---

## 8. Checklists

Action items generated from the family's account and device security profile.

### GET /api/checklists

List checklist items. Supports filtering.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `severity` | string | `low`, `medium`, `high`, `critical` |
| `status` | string | `Pending`, `Done`, `Dismissed` |
| `category` | string | `AccountSecurity`, `DeviceHealth`, `BackupRecovery` |
| `search` | string | Free-text search on title/description |

**Response** — `200 OK`

```json
[
  {
    "id": "...",
    "title": "Enable two-factor authentication",
    "description": "Your Gmail account does not have 2FA enabled.",
    "category": "AccountSecurity",
    "status": "Pending",
    "priority": 1,
    "sourceType": "Account",
    "sourceId": "...",
    "dueAt": "2026-04-30T00:00:00Z",
    "helpUrl": "https://support.google.com/accounts/answer/185839"
  }
]
```

---

### GET /api/checklists/summary

Returns completion counts.

**Response** — `200 OK`

```json
{
  "totalTasks": 18,
  "highPriorityTasks": 5,
  "inProgressTasks": 2,
  "completedTasks": 8
}
```

---

### PATCH /api/checklists/{id}/status

Update the status of a checklist item.

**Request**

```json
{ "status": "Done" }
```

`status` values: `Pending`, `Done`, `Dismissed`

**Response** — `200 OK` — `ChecklistItemDto`

---

## 9. Incidents

Report and track digital security incidents.

### GET /api/incidents

List all incidents for the family.

**Response** — `200 OK`

```json
[
  {
    "id": "...",
    "familyId": "...",
    "type": "PhishingAttempt",
    "severity": "High",
    "status": "Open",
    "summary": "Received a suspicious email asking for banking credentials.",
    "firstActionPlan": "Do not click any links. Report to your email provider.",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

`type` values: `PhishingAttempt`, `Malware`, `AccountCompromise`, `DataBreach`, `UnauthorizedAccess`, `IdentityTheft`, `ScamCall`, `Other`

`severity` values: `Low`, `Medium`, `High`, `Critical`

`status` values: `Open`, `InProgress`, `Resolved`, `Dismissed`

---

### GET /api/incidents/{id}

Get a single incident by ID.

**Response** — `200 OK` — `IncidentResponse`

**Error responses:** `404 Not Found`, `403 Forbidden`

---

### POST /api/incidents

Report a new incident. Rate limited (`mutations` policy).

**Request**

```json
{
  "type": "PhishingAttempt",
  "severity": "High",
  "summary": "Received a suspicious email asking for banking credentials."
}
```

**Response** — `201 Created` — `IncidentResponse`

---

### PATCH /api/incidents/{id}/status

Update the status of an incident. Rate limited (`mutations` policy).

**Request**

```json
{ "status": "Resolved" }
```

**Response** — `200 OK` — `IncidentResponse`

---

## 10. Reports

View security reports generated for the family (by assessments, incidents, or admin staff).

### GET /api/reports

List reports. Supports filtering.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `reportType` | string | `Assessment`, `Incident`, `FamilyReset` |
| `search` | string | Free-text on title/description |
| `fromDate` | ISO 8601 | Earliest generation date |
| `toDate` | ISO 8601 | Latest generation date |

**Response** — `200 OK`

```json
[
  {
    "id": "...",
    "reportType": "Assessment",
    "title": "Security Assessment — April 2026",
    "description": "Overall risk level: Medium. Score: 72/100.",
    "fileUrl": "https://cdn.example.com/reports/abc.pdf",
    "generatedAt": "2026-04-04T10:00:00Z",
    "bookingId": null,
    "incidentId": null,
    "createdByUserId": "..."
  }
]
```

---

### GET /api/reports/summary

Returns counts grouped by type.

**Response** — `200 OK`

```json
{
  "totalReports": 5,
  "assessmentReports": 3,
  "incidentReports": 1,
  "familyResetReports": 1,
  "latestGeneratedAt": "2026-04-04T10:00:00Z"
}
```

---

### GET /api/reports/{id}

Get full report detail.

**Response** — `200 OK`

```json
{
  "id": "...",
  "familyId": "...",
  "reportType": "Assessment",
  "title": "...",
  "description": "...",
  "fileUrl": "...",
  "generatedAt": "...",
  "bookingId": null,
  "incidentId": null,
  "createdByUserId": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### GET /api/reports/{id}/download

Get the download URL and file metadata for a report.

**Response** — `200 OK`

```json
{
  "fileUrl": "https://cdn.example.com/reports/abc.pdf",
  "fileName": "Security_Assessment_April_2026.pdf",
  "contentType": "application/pdf"
}
```

---

## 11. Bookings & Service Packages

Book a professional consultation or service.

### GET /api/service-packages

List all available (active) service packages.

**Response** — `200 OK`

```json
[
  {
    "id": "...",
    "name": "Family Security Review",
    "description": "A 60-minute guided review of your family's digital security posture.",
    "priceDisplay": "499,000 VND",
    "durationLabel": "60 minutes"
  }
]
```

---

### POST /api/bookings

Create a booking in **Draft** state. Call the [submit endpoint](#post-apibookingsidsubmit) to confirm.

**Request**

```json
{
  "packageId": "...",
  "preferredStartAt": "2026-04-20T09:00:00+07:00",
  "channel": "Online",
  "customerNotes": "Prefer morning sessions.",
  "source": "Direct",
  "sourceIncidentId": null,
  "sourceAssessmentId": null
}
```

| Field | Type | Allowed values |
|-------|------|---------------|
| `channel` | string | `Online`, `Phone`, `InPerson` |
| `source` | string | `Direct`, `IncidentFollowUp`, `AssessmentFollowUp` |

**Response** — `201 Created` — `BookingResponse`

---

### POST /api/bookings/{id}/submit

Advance a Draft booking to **Submitted** (or **Confirmed** if the package is free). For paid packages, initiate payment after this step.

**Response** — `200 OK` — `BookingResponse`

---

### GET /api/bookings/my

List all bookings for the authenticated user's family.

**Response** — `200 OK` — array of `BookingResponse`

---

### GET /api/bookings/summary

Returns booking counts and recent bookings.

**Response** — `200 OK`

```json
{
  "totalBookings": 3,
  "upcomingBookings": 1,
  "awaitingConfirmation": 1,
  "recentBookings": [ /* BookingResponse[] */ ]
}
```

---

### GET /api/bookings/{id}

Get booking detail.

**BookingResponse** shape:

```json
{
  "id": "...",
  "familyId": "...",
  "packageId": "...",
  "packageName": "Family Security Review",
  "packageCode": "family-security-review",
  "packagePrice": 499000,
  "packageCurrency": "VND",
  "packageDurationMinutes": 60,
  "preferredStartAt": "2026-04-20T09:00:00+07:00",
  "confirmedStartAt": null,
  "confirmedEndAt": null,
  "channel": "Online",
  "source": "Direct",
  "sourceIncidentId": null,
  "sourceAssessmentId": null,
  "customerNotes": "Prefer morning sessions.",
  "status": "Submitted",
  "paymentStatus": "Pending",
  "expiresAt": null,
  "completedAt": null,
  "assignedAdminUserId": null,
  "assignedAdminEmail": null,
  "createdAt": "...",
  "updatedAt": "...",
  "primaryReport": null
}
```

`status` values: `Draft`, `Submitted`, `Confirmed`, `InProgress`, `Completed`, `Cancelled`

`paymentStatus` values: `Pending`, `Paid`, `Refunded`, `Waived`

---

### GET /api/bookings/{id}/events

Returns the complete audit timeline for a booking.

**Response** — `200 OK`

```json
[
  {
    "id": "...",
    "eventType": "BookingCreated",
    "fromValue": null,
    "toValue": "Draft",
    "description": "Booking created.",
    "actorId": "...",
    "actorEmail": "user@example.com",
    "createdAt": "..."
  }
]
```

---

## 12. Payments

Initiate and manage payments for bookings. Payment flow:

1. Create a booking → submit it → call **initiate** to get a payment URL / QR code.
2. User completes payment on the gateway's page.
3. The gateway sends a webhook to `/api/webhooks/payment/{provider}` — the server verifies and updates the booking automatically.

### POST /api/bookings/{bookingId}/payment/initiate

Initiate payment for a submitted booking. Rate limited (`mutations` policy).

**Response** — `200 OK`

```json
{
  "paymentOrderId": "...",
  "bookingId": "...",
  "paymentUrl": "https://pay.payos.vn/web/abc123",
  "qrCodeUrl": null,
  "expiresAt": "2026-04-04T11:00:00Z",
  "gatewayProvider": "payOS",
  "amount": 499000,
  "currency": "VND"
}
```

Redirect the user to `paymentUrl`, or display `qrCodeUrl` as an in-app QR code for scan-to-pay flows.

**Error responses:** `400 Bad Request` (booking not in payable state), `403 Forbidden`, `404 Not Found`

---

### POST /api/bookings/{bookingId}/payment/retry

Retry a previously failed payment. Rate limited (`mutations` policy). Same response shape as `initiate`.

---

### GET /api/bookings/{bookingId}/payments

List all payment order attempts for a booking.

**Response** — `200 OK`

```json
[
  {
    "id": "...",
    "bookingId": "...",
    "amount": 499000,
    "currency": "VND",
    "status": "Pending",
    "gatewayProvider": "payOS",
    "gatewayOrderId": "payos_order_123",
    "paymentUrl": "https://pay.payos.vn/web/abc123",
    "qrCodeUrl": null,
    "paymentType": "Redirect",
    "failureReason": null,
    "paidAt": null,
    "expiresAt": "2026-04-04T11:00:00Z",
    "refundedAt": null,
    "refundedAmount": null,
    "createdAt": "..."
  }
]
```

`paymentType` values: `Redirect`, `QrCode`, `DirectCharge`

---

### POST /api/webhooks/payment/{provider}

Receives payment events from gateway servers. **Not for client use.**

- Security: verified by HMAC-SHA256 signature per provider. Requests with invalid signatures return `400 Bad Request`.
- Always returns `200 OK` quickly after verification — gateway retries on non-2xx responses.
- Supported providers: `payOS`, `momo`, `zalopay`, `mock`

**Response** — `200 OK`

```json
{ "received": true }
```

---

## 13. Settings

User profile and notification preferences.

### GET /api/settings

Get the current user's settings.

**Response** — `200 OK`

```json
{
  "profile": {
    "id": "...",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1-555-0100"
  },
  "notifications": {
    "emailNotificationsEnabled": true,
    "bookingUpdatesEnabled": true,
    "incidentAlertsEnabled": true,
    "reminderNotificationsEnabled": false
  }
}
```

---

### PUT /api/settings/profile

Update display name and phone number.

**Request**

```json
{
  "fullName": "Jane A. Smith",
  "phone": "+1-555-0101"
}
```

**Response** — `200 OK` — `ProfileDto`

---

### PUT /api/settings/notifications

Update notification preferences.

**Request**

```json
{
  "emailNotificationsEnabled": true,
  "bookingUpdatesEnabled": true,
  "incidentAlertsEnabled": true,
  "reminderNotificationsEnabled": true
}
```

**Response** — `200 OK` — `NotificationSettingsDto`

---

### POST /api/settings/change-password

Change the authenticated user's password.

**Request**

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePass456",
  "confirmNewPassword": "NewSecurePass456"
}
```

**Response** — `204 No Content`

**Error responses:** `400 Bad Request` (validation or wrong current password)

---

### POST /api/settings/request-data-export

Submit a request to export all personal data (GDPR-style).

**Response** — `200 OK`

```json
{
  "message": "Your data export request has been received. You will be notified by email when it is ready.",
  "requestedAt": "2026-04-04T10:00:00Z"
}
```

---

### POST /api/settings/request-account-deletion

Submit a request to permanently delete the account.

**Response** — `200 OK` — same shape as data export.

---

## 14. Dashboard

### GET /api/dashboard

Returns a summary of the family's current security status.

**Response** — `200 OK` — varies (see `DashboardService`). Includes recent assessment risk level, open incident count, checklist completion, upcoming bookings, and account/device summary counts.

---

## 15. Admin

All admin endpoints require `role = "Admin"`. Non-admin requests return `403 Forbidden`.

### Dashboard & Activity

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/dashboard` | Platform metrics: total users, bookings, incidents, revenue |
| `GET` | `/api/admin/activity` | System-wide activity feed (recent audit events) |

---

### Customers (Families)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/customers` | List all customer families with member counts |
| `GET` | `/api/admin/customers/{familyId}` | Full customer detail (family + members + bookings) |
| `POST` | `/api/admin/customers/{familyId}/notes` | Add an internal note to a customer |

---

### Bookings (Admin)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/bookings` | All bookings with filter support (`status`, `paymentStatus`, `search`) |
| `GET` | `/api/admin/bookings/{id}` | Full booking detail including notes and payment orders |
| `PATCH` | `/api/admin/bookings/{id}/status` | Update booking status (`Confirmed`, `InProgress`, `Completed`, `Cancelled`) |
| `PATCH` | `/api/admin/bookings/{id}/payment-status` | Manually update payment status (`Paid`, `Refunded`, `Waived`) |
| `PATCH` | `/api/admin/bookings/{id}/assign` | Assign booking to a staff member |
| `POST` | `/api/admin/bookings/{id}/notes` | Add internal note to a booking |
| `PUT` | `/api/admin/bookings/{id}/report` | Attach a completed report to a booking |

---

### Incidents (Admin)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/incidents` | All incidents with filter support |
| `GET` | `/api/admin/incidents/{id}` | Full incident detail including notes |
| `PATCH` | `/api/admin/incidents/{id}/status` | Update incident status |
| `POST` | `/api/admin/incidents/{id}/notes` | Add internal note to an incident |

---

### Reports (Admin)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/reports` | All reports across all families |
| `GET` | `/api/admin/reports/{id}` | Report detail |
| `GET` | `/api/admin/reports/{id}/download` | Report download URL |

---

### Service Packages

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/service-packages` | List all packages (including inactive) |
| `POST` | `/api/admin/service-packages` | Create a new service package |
| `PUT` | `/api/admin/service-packages/{id}` | Update package details |
| `PATCH` | `/api/admin/service-packages/{id}/status` | Activate or deactivate a package |

---

### Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/users` | List all user accounts |
| `GET` | `/api/admin/users/{id}` | User detail including status and family |
| `PATCH` | `/api/admin/users/{id}/status` | Suspend or reactivate a user |
| `PATCH` | `/api/admin/users/{id}/role` | Change user role (`User` ↔ `Admin`) |
| `POST` | `/api/admin/users/{id}/trigger-password-reset` | Force a password reset for a user |

---

### Audit Log

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/audit-logs` | Pageable audit trail of all platform events |

---

## 16. Error Responses

All error responses use the same shape:

```json
{ "error": "Human-readable description of what went wrong." }
```

| HTTP Code | Meaning |
|-----------|---------|
| `400 Bad Request` | Invalid request body or missing required field |
| `401 Unauthorized` | Not authenticated (no valid session cookie) |
| `403 Forbidden` | Authenticated but not permitted (e.g. no family, or not an admin) |
| `404 Not Found` | Resource does not exist or does not belong to this user |
| `409 Conflict` | Duplicate resource (e.g. email already registered) |
| `429 Too Many Requests` | Rate limit exceeded — see `Retry-After` header |
| `500 Internal Server Error` | Unexpected server error (no details are leaked to the client) |

---

## 17. Rate Limiting

Two fixed-window rate limit policies are applied:

| Policy | Endpoints | Limit |
|--------|-----------|-------|
| `auth` | `POST /api/auth/login`, `POST /api/auth/register` | 10 requests / minute per client IP |
| `mutations` | `POST /api/incidents`, `POST /api/bookings`, `POST /api/bookings/{id}/submit`, `POST /api/bookings/{id}/payment/initiate`, `POST /api/bookings/{id}/payment/retry`, `PATCH /api/incidents/{id}/status` | 20 requests / minute per client IP |

Rejected requests receive `429 Too Many Requests`. Clients should respect the `Retry-After` header before retrying.
