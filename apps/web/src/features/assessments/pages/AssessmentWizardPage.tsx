import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageLayout } from '@/components/layout/PageLayout'
import { useAssessmentQuestions } from '../hooks/useAssessmentQueries'
import { useSubmitAssessment } from '../hooks/useAssessmentMutations'
import { groupQuestionsByCategory } from '../assessments.types'
import { WizardProgress } from '../components/WizardProgress'
import { QuestionCard } from '../components/QuestionCard'

// ── Schema ────────────────────────────────────────────────────────────────────
// Validated per-step: every question on the current step must have a value.
// stepSchema is created inside the component so it can use t() for its message.

type StepFormValues = Record<string, string>

// ── Category icons ─────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  accountSecurity: '🔐',
  deviceHygiene:   '💻',
  backupRecovery:  '☁️',
  privacySharing:  '👁️',
  scamReadiness:   '🎣',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AssessmentWizardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('assessments')
  const { data: questions, isLoading, isError } = useAssessmentQuestions()
  const submitMutation = useSubmitAssessment()

  // Schema defined inside component to pick up the current locale from t()
  const stepSchema = z.record(z.string().min(1, t('wizard.pleaseSelectAnswer')))

  // All accumulated answers across steps: questionId → selectedValue
  const [allAnswers, setAllAnswers] = useState<Record<string, string>>({})

  // Current step index (each step = one category)
  const [stepIndex, setStepIndex] = useState(0)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StepFormValues>({ resolver: zodResolver(stepSchema) })

  if (isLoading) {
    return (
      <PageLayout title={t('wizard.pageTitle')}>
        <p className="text-sm text-gray-500">{t('wizard.loading')}</p>
      </PageLayout>
    )
  }

  if (isError || !questions) {
    return (
      <PageLayout title={t('wizard.pageTitle')}>
        <div className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
          {t('wizard.loadError')}
        </div>
      </PageLayout>
    )
  }

  const steps = groupQuestionsByCategory(questions)
  const totalSteps = steps.length
  const currentStep = steps[stepIndex]
  const isLastStep = stepIndex === totalSteps - 1

  async function onStepSubmit(stepValues: StepFormValues) {
    const merged = { ...allAnswers, ...stepValues }
    setAllAnswers(merged)

    if (!isLastStep) {
      setStepIndex((i) => i + 1)
      return
    }

    // Final step — submit to API
    const answers = Object.entries(merged).map(([questionId, selectedValue]) => ({
      questionId,
      selectedValue,
    }))

    await submitMutation.mutateAsync({ answers })
    navigate('/assessment/result')
  }

  const categoryLabel = t(`categories.${currentStep.category}`, { defaultValue: currentStep.category })
  const categoryIcon  = CATEGORY_ICONS[currentStep.category] ?? '📋'

  return (
    <PageLayout title={t('wizard.pageTitle')}>
      <div className="mx-auto max-w-xl">
        {/* Progress */}
        <WizardProgress
          currentStep={stepIndex + 1}
          totalSteps={totalSteps}
          stepLabel={t('wizard.stepLabel', { current: stepIndex + 1, label: categoryLabel })}
        />

        {/* Step header */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">{categoryIcon}</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{categoryLabel}</h2>
            <p className="text-xs text-gray-500">
              {t('wizard.questionCount', { count: currentStep.questions.length })}
            </p>
          </div>
        </div>

        {/* Questions form */}
        <form onSubmit={handleSubmit(onStepSubmit)} noValidate>
          <div className="space-y-8">
            {currentStep.questions.map((question) => {
              const fieldError = errors[question.id]
              return (
                <div key={question.id}>
                  <Controller
                    name={question.id}
                    control={control}
                    defaultValue={allAnswers[question.id] ?? ''}
                    render={({ field }) => (
                      <QuestionCard
                        question={question}
                        selectedValue={field.value || undefined}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {fieldError && (
                    <p className="mt-2 text-xs text-red-500">{t('wizard.pleaseSelectAnswer')}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStepIndex((i) => i - 1)}
              disabled={stepIndex === 0}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← {t('wizard.back')}
            </button>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {submitMutation.isPending
                ? t('wizard.submitting')
                : isLastStep
                  ? t('wizard.submit')
                  : `${t('wizard.next')} →`}
            </button>
          </div>

          {submitMutation.isError && (
            <p className="mt-4 text-center text-sm text-red-500">
              {t('wizard.submitError')}
            </p>
          )}
        </form>

        {/* Step dots */}
        <div className="mt-6 flex justify-center gap-1.5" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className={[
                'h-1.5 rounded-full transition-all',
                i === stepIndex
                  ? 'w-6 bg-blue-600'
                  : i < stepIndex
                    ? 'w-1.5 bg-blue-300'
                    : 'w-1.5 bg-gray-200',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
