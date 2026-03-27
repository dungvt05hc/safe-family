import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui'
import {
  INCIDENT_TYPE_CONFIG,
  SEVERITY_CONFIG,
  type IncidentType,
  type IncidentSeverity,
} from '../incidents.types'
import { useReportIncident } from '../hooks/useIncidentMutations'

const schema = z.object({
  type: z.string().min(1, 'Incident type is required') as z.ZodType<IncidentType>,
  severity: z.string().min(1, 'Severity is required') as z.ZodType<IncidentSeverity>,
  summary: z
    .string()
    .min(10, 'Please provide at least 10 characters')
    .max(500, 'Summary must be 500 characters or fewer'),
})

type FormValues = z.infer<typeof schema>

export function IncidentWizardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const preselectedType = (location.state as { type?: IncidentType } | null)?.type

  const { mutate: reportIncident, isPending } = useReportIncident()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: preselectedType ?? undefined,
      severity: undefined,
      summary: '',
    },
  })

  useEffect(() => {
    if (preselectedType) setValue('type', preselectedType)
  }, [preselectedType, setValue])

  const selectedType = watch('type')
  const selectedSeverity = watch('severity')

  function onSubmit(values: FormValues) {
    reportIncident(values, {
      onSuccess: (result) => {
        navigate(`/incidents/result/${result.id}`)
      },
    })
  }

  return (
    <PageLayout
      title="Incident Details"
      description="Provide details about the incident so we can generate a first action plan."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Incident type */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Incident Type
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(INCIDENT_TYPE_CONFIG) as IncidentType[]).map((type) => {
              const config = INCIDENT_TYPE_CONFIG[type]
              return (
                <label
                  key={type}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                    selectedType === type
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={type}
                    {...register('type')}
                    className="sr-only"
                  />
                  <span className="text-xl">{config.icon}</span>
                  <span className="font-medium">{config.label}</span>
                </label>
              )
            })}
          </div>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        {/* Severity */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Severity
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(SEVERITY_CONFIG) as IncidentSeverity[]).map((sev) => {
              const config = SEVERITY_CONFIG[sev]
              return (
                <label
                  key={sev}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-3 text-center text-sm transition ${
                    selectedSeverity === sev
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={sev}
                    {...register('severity')}
                    className="sr-only"
                  />
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${config.color}`}
                  >
                    {config.label}
                  </span>
                  <span className="text-gray-500">{config.description}</span>
                </label>
              )
            })}
          </div>
          {errors.severity && (
            <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
          )}
        </div>

        {/* Summary */}
        <div>
          <label
            htmlFor="summary"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Summary
          </label>
          <textarea
            id="summary"
            rows={4}
            placeholder="Briefly describe what happened…"
            {...register('summary')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.summary && (
            <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/incidents')}
          >
            Back
          </Button>
          <Button type="submit" loading={isPending}>
            Submit Incident
          </Button>
        </div>
      </form>
    </PageLayout>
  )
}
