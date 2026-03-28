import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/features/home/pages/HomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { GuestRoute } from '@/features/auth/components/GuestRoute'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { FamilyOnboardingPage } from '@/features/families/pages/FamilyOnboardingPage'
import { FamilyMembersPage } from '@/features/families/pages/FamilyMembersPage'
import { AccountsPage } from '@/features/accounts/pages/AccountsPage'
import { DevicesPage } from '@/features/devices/pages/DevicesPage'
import { AssessmentStartPage } from '@/features/assessments/pages/AssessmentStartPage'
import { AssessmentWizardPage } from '@/features/assessments/pages/AssessmentWizardPage'
import { AssessmentResultPage } from '@/features/assessments/pages/AssessmentResultPage'
import { AssessmentHistoryPage } from '@/features/assessments/pages/AssessmentHistoryPage'
import { IncidentSelectPage } from '@/features/incidents/pages/IncidentSelectPage'
import { IncidentWizardPage } from '@/features/incidents/pages/IncidentWizardPage'
import { IncidentResultPage } from '@/features/incidents/pages/IncidentResultPage'
import { IncidentDetailsPage } from '@/features/incidents/pages/IncidentDetailsPage'
import { BookingFormPage } from '@/features/bookings/pages/BookingFormPage'
import { MyBookingsPage } from '@/features/bookings/pages/MyBookingsPage'
import { BookingDetailsPage } from '@/features/bookings/pages/BookingDetailsPage'
import { ChecklistPage } from '@/features/checklists/ChecklistPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { AdminProtectedRoute } from '@/features/admin/components/AdminProtectedRoute'
import { AdminAppShell } from '@/features/admin/components/AdminAppShell'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminCustomersPage } from '@/features/admin/pages/AdminCustomersPage'
import { AdminBookingsPage } from '@/features/admin/pages/AdminBookingsPage'
import { AdminIncidentsPage } from '@/features/admin/pages/AdminIncidentsPage'
import { AdminAuditLogPage } from '@/features/admin/pages/AdminAuditLogPage'
import { AdminActivityPage } from '@/features/admin/activity/AdminActivityPage'
import { AdminReportsPage } from '@/features/admin/pages/AdminReportsPage'
import { AdminServicePackagesPage } from '@/features/admin/pages/AdminServicePackagesPage'
import { AdminUsersPage } from '@/features/admin/users/AdminUsersPage'
import { AdminUserDetailPage } from '@/features/admin/users/AdminUserDetailPage'
import { AdminCustomerDetailPage } from '@/features/admin/pages/AdminCustomerDetailPage'
import { AdminNotesPage } from '@/features/admin/notes/AdminNotesPage'

export const router = createBrowserRouter([
  // ── Guest-only routes (redirect to /dashboard when already signed in) ──────
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },

  // ── Public shell (home page + 404) ─────────────────────────────────────────
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },

  // ── Authenticated app shell (sidebar + topbar) ─────────────────────────────
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard',         element: <DashboardPage /> },
      { path: 'family/new',        element: <FamilyOnboardingPage /> },
      { path: 'family/members',    element: <FamilyMembersPage /> },
      { path: 'accounts',          element: <AccountsPage /> },
      { path: 'devices',           element: <DevicesPage /> },
      { path: 'assessment',         element: <AssessmentStartPage /> },
      { path: 'assessment/wizard',   element: <AssessmentWizardPage /> },
      { path: 'assessment/result',   element: <AssessmentResultPage /> },
      { path: 'assessment/history',  element: <AssessmentHistoryPage /> },
      { path: 'incidents',            element: <IncidentSelectPage /> },
      { path: 'incidents/report',     element: <IncidentWizardPage /> },
      { path: 'incidents/result/:id', element: <IncidentResultPage /> },
      { path: 'incidents/:id',        element: <IncidentDetailsPage /> },
      { path: 'checklists',         element: <ChecklistPage /> },
      { path: 'reports',            element: <ReportsPage /> },
      { path: 'bookings',          element: <BookingFormPage /> },
      { path: 'bookings/my',       element: <MyBookingsPage /> },
      { path: 'bookings/:id',      element: <BookingDetailsPage /> },
      { path: 'settings',           element: <SettingsPage /> },
    ],
  },

  // ── Admin shell ─────────────────────────────────────────────────────────────
  {
    element: (
      <AdminProtectedRoute>
        <AdminAppShell />
      </AdminProtectedRoute>
    ),
    children: [
      { path: 'admin',               element: <AdminDashboardPage /> },
      { path: 'admin/users',           element: <AdminUsersPage /> },
      { path: 'admin/users/:id',       element: <AdminUserDetailPage /> },
      { path: 'admin/customers',              element: <AdminCustomersPage /> },
      { path: 'admin/customers/:familyId',    element: <AdminCustomerDetailPage /> },
      { path: 'admin/bookings',      element: <AdminBookingsPage /> },
      { path: 'admin/incidents',     element: <AdminIncidentsPage /> },
      { path: 'admin/reports',       element: <AdminReportsPage /> },
      { path: 'admin/packages',      element: <AdminServicePackagesPage /> },
      { path: 'admin/notes',         element: <AdminNotesPage /> },
      { path: 'admin/activity',      element: <AdminActivityPage /> },
      // Legacy: keep /admin/audit-log working
      { path: 'admin/audit-log',     element: <AdminAuditLogPage /> },
    ],
  },
])

