import type { AssessmentQuestion, QuestionOption } from '../assessments.types'
import { CATEGORY_LABELS } from '../assessments.types'

interface QuestionCardProps {
  question: AssessmentQuestion
  selectedValue: string | undefined
  onChange: (value: string) => void
}

export function QuestionCard({ question, selectedValue, onChange }: QuestionCardProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
        {CATEGORY_LABELS[question.category] ?? question.category}
      </p>
      <p className="mb-5 text-base font-medium leading-snug text-gray-900">{question.text}</p>

      <div className="space-y-2" role="radiogroup" aria-label={question.text}>
        {question.options.map((option: QuestionOption) => {
          const checked = selectedValue === option.value
          return (
            <label
              key={option.value}
              className={[
                'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                checked
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40',
              ].join(' ')}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 accent-blue-600"
              />
              <span className={`text-sm ${checked ? 'font-medium text-blue-800' : 'text-gray-700'}`}>
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
