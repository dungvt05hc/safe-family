import { motion } from 'framer-motion'
import { Download, Eye, FileText, Tag } from 'lucide-react'
import { fadeUpVariants } from '@/lib/motion'
import { Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  REPORT_TYPE_BADGE,
  REPORT_TYPE_LABEL,
  type Report,
} from '../reports.types'
import { useDownloadReport } from '../reports.hooks'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReportCardProps {
  report:     Report
  isSelected: boolean
  index:      number
  onSelect:   (report: Report) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ReportCard — a single row/card in the report list.
 * Highlights when selected (master-detail). Two actions: View and Download.
 */
export function ReportCard({ report, isSelected, index, onSelect }: ReportCardProps) {
  const { mutate: download, isPending: isDownloading } = useDownloadReport()

  const date = new Date(report.generatedAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <motion.div
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -1 }}
      onClick={() => onSelect(report)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(report)}
      className={cn(
        'group relative rounded-2xl border bg-white px-5 py-4 shadow-sm cursor-pointer',
        'transition-all duration-150 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300',
        isSelected
          ? 'border-blue-300 ring-2 ring-blue-100 shadow-md'
          : 'border-gray-100 hover:border-gray-200',
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        {/* Icon + title */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              'mt-0.5 flex items-center justify-center w-9 h-9 rounded-xl shrink-0',
              report.type === 'Assessment'  && 'bg-blue-50   text-blue-500',
              report.type === 'Incident'    && 'bg-red-50    text-red-500',
              report.type === 'FamilyReset' && 'bg-green-50  text-green-600',
            )}
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 leading-snug truncate">
              {report.title}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {report.description}
            </p>
          </div>
        </div>

        {/* Type badge */}
        <div className="shrink-0">
          <Badge variant={REPORT_TYPE_BADGE[report.type]}>
            {REPORT_TYPE_LABEL[report.type]}
          </Badge>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Tag className="w-3 h-3" aria-hidden="true" />
            {date}
          </span>
          {report.contextLabel && (
            <span className="text-xs text-gray-400 truncate max-w-[240px]">
              {report.contextLabel}
            </span>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()} // prevent card click when using buttons
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(report)}
            aria-label={`View ${report.title}`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={isDownloading}
            onClick={() => download(report)}
            aria-label={`Download ${report.title}`}
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Download
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
