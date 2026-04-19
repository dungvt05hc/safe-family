import { motion } from 'framer-motion'
import { CalendarDays, FileText, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fadeUpVariants } from '@/lib/motion'
import type { IncidentRecoveryPack } from '../plans.types'

// ── Component ─────────────────────────────────────────────────────────────────

interface WhatHappenedSectionProps {
  pack: IncidentRecoveryPack
}

export function WhatHappenedSection({ pack }: WhatHappenedSectionProps) {
  const date = new Date(pack.createdAt).toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={0}
      aria-labelledby="what-happened-heading"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <FileText className="h-4 w-4 text-gray-500" aria-hidden="true" />
            </span>
            <h2 id="what-happened-heading" className="text-base font-semibold text-gray-900">
              What Happened
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {date}
          </div>
        </div>

        {/* Narrative */}
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {pack.whatHappened || 'Details are being documented by your advisor.'}
        </p>

        {/* Context links */}
        {(pack.bookingId || pack.linkedIncidentId) && (
          <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
            <LinkIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
            {pack.bookingId && (
              <Link
                to={`/bookings/${pack.bookingId}`}
                className="hover:text-blue-600 hover:underline transition-colors"
              >
                View session booking
              </Link>
            )}
            {pack.linkedIncidentId && (
              <>
                <span aria-hidden="true">·</span>
                <Link
                  to={`/incidents/${pack.linkedIncidentId}`}
                  className="hover:text-blue-600 hover:underline transition-colors"
                >
                  View incident record
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </motion.section>
  )
}
