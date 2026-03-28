import { motion } from 'framer-motion'
import { CheckCircle2, Flame, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ImmediateActionsProps {
  actions:       string[]
  hasAssessment: boolean
}

/**
 * ImmediateActions — lists the top personalised security actions derived from
 * the latest risk assessment. Prompts to run one when none exists.
 */
export function ImmediateActions({ actions, hasAssessment }: ImmediateActionsProps) {
  const navigate = useNavigate()

  const fadeUp = {
    hidden:  { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.07, duration: 0.3, ease: 'easeOut' as const },
    }),
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-gray-700">Immediate Actions</h2>
      </div>

      {/* Content */}
      {actions.length > 0 ? (
        <ul className="divide-y divide-gray-50">
          {actions.slice(0, 4).map((action, i) => (
            <motion.li
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex items-start gap-3 px-5 py-3.5"
            >
              <div className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 shrink-0">
                <span className="text-orange-600 text-[10px] font-bold">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-700 leading-snug">{action}</p>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center px-6">
          {hasAssessment ? (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <Info className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
          )}
          <p className="text-sm text-gray-500">
            {hasAssessment
              ? 'No immediate actions — great job! Your scores are all healthy.'
              : 'Run a risk assessment to get personalised action items.'}
          </p>
        </div>
      )}

      {/* Footer CTA */}
      {hasAssessment && (
        <div className="px-5 py-3 border-t border-gray-50">
          <button
            type="button"
            onClick={() => navigate('/assessment')}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            View full assessment
          </button>
        </div>
      )}
    </div>
  )
}
