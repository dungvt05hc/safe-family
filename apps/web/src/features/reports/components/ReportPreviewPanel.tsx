import { AnimatePresence, motion } from 'framer-motion'
import { Download, FileText, X } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import type { Report } from '../reports.types'
import { REPORT_TYPE_BADGE, REPORT_TYPE_LABEL } from '../reports.types'
import { useDownloadReport } from '../reports.hooks'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReportPreviewPanelProps {
  report:   Report | null
  onClose:  () => void
}

// ── Animation variants ────────────────────────────────────────────────────────

const panelVariants = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit:    { opacity: 0, x: 32, transition: { duration: 0.18, ease: 'easeIn' as const } },
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function Placeholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-4 text-center px-8">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 text-gray-400">
        <FileText className="w-7 h-7" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">No report selected</p>
        <p className="text-xs text-gray-400 mt-1 max-w-[200px] leading-relaxed">
          Choose a report from the list to view its full details here.
        </p>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ReportPreviewPanel — right-side detail panel for the master-detail reports layout.
 *
 * On large screens this sits as a sticky right column.
 * On mobile it is rendered inline below the list when a report is selected.
 */
export function ReportPreviewPanel({ report, onClose }: ReportPreviewPanelProps) {
  const { mutate: download, isPending: isDownloading } = useDownloadReport()

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <AnimatePresence mode="wait" initial={false}>
        {report === null ? (
          <motion.div
            key="placeholder"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex-1"
          >
            <Placeholder />
          </motion.div>
        ) : (
          <motion.div
            key={report.id}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col flex-1"
          >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge variant={REPORT_TYPE_BADGE[report.type]}>
                    {REPORT_TYPE_LABEL[report.type]}
                  </Badge>
                </div>
                <h2 className="text-base font-semibold text-gray-900 leading-snug">
                  {report.title}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {report.contextLabel ? `${report.contextLabel} · ` : ''}
                  {new Date(report.generatedAt).toLocaleDateString('en-AU', {
                    day:   'numeric',
                    month: 'long',
                    year:  'numeric',
                  })}
                </p>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Body ────────────────────────────────────────────────────── */}
            <div className="flex-1 px-5 py-4 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {report.body}
              </pre>
            </div>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            {report.downloadUrl !== null && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => download(report)}
                  disabled={isDownloading}
                  className="w-full"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  {isDownloading ? 'Downloading…' : 'Download Report'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
