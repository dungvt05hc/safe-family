import { motion } from 'framer-motion'
import { XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fadeUpVariants } from '@/lib/motion'

// ── Text parser ───────────────────────────────────────────────────────────────

function parseLines(raw: string): string[] {
  return raw
    .split('\n')
    .map(l => l.replace(/^[-*•✗✕]\s*/, '').trim())
    .filter(Boolean)
}

// ── Component ─────────────────────────────────────────────────────────────────

interface WhatNotToDoSectionProps {
  whatNotToDo: string
}

export function WhatNotToDoSection({ whatNotToDo }: WhatNotToDoSectionProps) {
  const { t } = useTranslation('plans')
  const lines = parseLines(whatNotToDo)

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={2}
      aria-labelledby="what-not-to-do-heading"
    >
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-4">
        {/* Section header */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
            <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
          </span>
          <h2 id="what-not-to-do-heading" className="text-base font-semibold text-red-900">
            {t('incidentRecovery.sections.whatNotToDoHeading')}
          </h2>
        </div>

        <p className="text-xs text-red-600 font-medium">
          {t('incidentRecovery.sections.whatNotToDoWarning')}
        </p>

        {lines.length > 0 ? (
          <ul className="space-y-2.5" role="list">
            {lines.map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <XCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  aria-hidden="true"
                />
                <span className="text-sm text-red-800 leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-red-700 leading-relaxed whitespace-pre-line">
            {whatNotToDo}
          </p>
        )}
      </div>
    </motion.section>
  )
}
