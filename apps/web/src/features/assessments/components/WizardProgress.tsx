interface WizardProgressProps {
  currentStep: number
  totalSteps: number
  stepLabel: string
}

export function WizardProgress({ currentStep, totalSteps, stepLabel }: WizardProgressProps) {
  const pct = Math.round(((currentStep) / totalSteps) * 100)

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{stepLabel}</span>
        <span className="text-gray-400">
          {currentStep} / {totalSteps}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
