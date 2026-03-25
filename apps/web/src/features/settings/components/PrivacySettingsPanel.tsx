import { useState } from 'react'
import { Download, ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import { Alert, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useRequestDataExport } from '../settings.hooks'

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * PrivacySettingsPanel — lets users request a copy of their data download
 * and links to the privacy policy and help resources.
 */
export function PrivacySettingsPanel() {
  const requestExport  = useRequestDataExport()
  const [requested, setRequested] = useState(false)

  async function handleExport() {
    setRequested(false)
    await requestExport.mutateAsync()
    setRequested(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <CardTitle>Privacy &amp; data</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Info banner */}
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-4">
          <p className="text-sm text-blue-800 font-medium mb-1">Your data belongs to you</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            SafeFamily stores only the information needed to protect your family. You can request
            a full export at any time — we'll email you a download link within 48 hours.
          </p>
        </div>

        {/* Export request */}
        <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Download className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">Request data export</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Download a copy of all data SafeFamily holds about your account,
              family members, and activity history.
            </p>

            {requested && (
              <Alert variant="success" className="mt-3">
                Request received! We'll email you a download link within 48 hours.
              </Alert>
            )}
            {requestExport.isError && (
              <Alert variant="error" className="mt-3">
                Failed to submit request. Please try again later.
              </Alert>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            loading={requestExport.isPending}
            disabled={requested}
            className="shrink-0"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            {requested ? 'Requested' : 'Request export'}
          </Button>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <a
            href="#"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            Privacy policy
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            How we use your data
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
