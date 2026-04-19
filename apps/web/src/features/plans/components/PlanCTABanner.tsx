import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fadeUpVariants } from '@/lib/motion'

interface PlanCTABannerProps {
  completedTasks: number
  totalTasks:     number
}

export function PlanCTABanner({ completedTasks, totalTasks }: PlanCTABannerProps) {
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={5}
    >
      <Link
        to="/checklist"
        className="group block w-full rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white transition-opacity group-hover:opacity-95">
          {/* Background shimmer */}
          <span
            className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-white/10 group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-sm">Open Full Safety Checklist</p>
                <p className="text-xs text-blue-200 mt-0.5">
                  {totalTasks > 0
                    ? `${completedTasks} of ${totalTasks} tasks complete · ${pct}%`
                    : 'View and manage all your safety tasks'}
                </p>
              </div>
            </div>

            {totalTasks > 0 && (
              <div className="flex items-center gap-3 shrink-0">
                {/* Small progress pill */}
                <div className="hidden sm:flex h-2 w-24 overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Overall progress"
                  />
                </div>
              </div>
            )}

            <ArrowRight
              className="h-5 w-5 shrink-0 text-blue-200 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
