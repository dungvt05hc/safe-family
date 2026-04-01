import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { SUPPORT_STATUSES, SUPPORT_STATUS_LABELS, type DeviceFormValues } from '../devices.types'
import { deviceSchema, DEVICE_FORM_DEFAULTS } from '../devices.schema'
import {
  useDeviceTypes,
  useBrands,
  useModels,
  useOsFamilies,
  useOsVersions,
} from '../deviceCatalog.hooks'
import type { CatalogModel } from '../deviceCatalog.types'
import { SearchableSelect } from '@/components/SearchableSelect'
import { Alert, Button } from '@/components/ui'
import { Loader2 } from 'lucide-react'
import type { FamilyMember } from '@/features/families/families.types'

interface Props {
  members?: FamilyMember[]
  defaultValues?: Partial<DeviceFormValues>
  onSubmit: (values: DeviceFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel?: string
  serverError?: string | null
}

const selectClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700'
const errorClass = 'mt-1 text-xs text-red-500'
const hintClass = 'mt-1 text-xs text-gray-400'
const sectionHeadingClass = 'text-xs font-semibold uppercase tracking-wide text-gray-400'

/** Tiny inline spinner shown next to labels while catalog data loads. */
function InlineSpinner() {
  return <Loader2 className="inline h-3 w-3 animate-spin text-gray-400" aria-hidden="true" />
}

export function DeviceForm({
  members = [],
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Save',
  serverError,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      ...DEVICE_FORM_DEFAULTS,
      ...defaultValues,
    },
  })

  const deviceTypeCode = watch('deviceTypeCode')
  const brandCode = watch('brandCode')
  const modelCode = watch('modelCode')
  const osFamilyCode = watch('osFamilyCode')

  // ── Catalog queries ──────────────────────────────────────────────────────

  const { data: deviceTypes = [], isLoading: loadingTypes } = useDeviceTypes()
  const { data: brands = [], isLoading: loadingBrands } = useBrands(deviceTypeCode || undefined)
  const { data: models = [], isLoading: loadingModels } = useModels(
    deviceTypeCode || undefined,
    brandCode || undefined,
  )
  const { data: osFamilies = [], isLoading: loadingOsFamilies } = useOsFamilies(modelCode || undefined)
  const { data: osVersions = [], isLoading: loadingOsVersions } = useOsVersions(osFamilyCode || undefined)

  // ── Dropdown options ─────────────────────────────────────────────────────

  const deviceTypeOptions = deviceTypes.map((i) => ({ value: i.code, label: i.name }))
  const brandOptions = brands.map((i) => ({ value: i.code, label: i.name }))
  const modelOptions = models.map((i) => ({ value: i.code, label: i.name }))
  const osFamilyOptions = osFamilies.map((i) => ({ value: i.code, label: i.name }))
  const osVersionOptions = osVersions.map((i) => ({ value: i.code, label: i.name }))

  // ── Cascade resets (skip on initial render so edit-mode values stick) ────

  const isInitialMount = useRef(true)
  useEffect(() => {
    isInitialMount.current = false
  }, [])

  // Keep a snapshot of models data so the model-change effect reads current
  // data without needing `models` in its dependency array.
  const modelsRef = useRef<CatalogModel[]>(models)
  modelsRef.current = models

  useEffect(() => {
    if (isInitialMount.current) return
    setValue('brandCode', '')
    setValue('modelCode', '')
    setValue('osFamilyCode', '')
    setValue('osVersionCode', '')
  }, [deviceTypeCode, setValue])

  useEffect(() => {
    if (isInitialMount.current) return
    setValue('modelCode', '')
    setValue('osFamilyCode', '')
    setValue('osVersionCode', '')
  }, [brandCode, setValue])

  useEffect(() => {
    if (isInitialMount.current) return
    // Auto-select the model's default OS family when a model is picked
    const selected = modelsRef.current.find((m) => m.code === modelCode)
    setValue('osFamilyCode', selected?.defaultOsFamilyCode ?? '')
    setValue('osVersionCode', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelCode, setValue])

  useEffect(() => {
    if (isInitialMount.current) return
    setValue('osVersionCode', '')
  }, [osFamilyCode, setValue])

  // ── Placeholder helpers ──────────────────────────────────────────────────

  function brandPlaceholder() {
    if (!deviceTypeCode) return 'Choose a device type first'
    if (loadingBrands) return 'Loading brands…'
    if (brands.length === 0) return 'No brands for this type'
    return 'Select brand…'
  }

  function modelPlaceholder() {
    if (!brandCode) return 'Choose a brand first'
    if (loadingModels) return 'Loading models…'
    if (models.length === 0) return 'No models for this brand'
    return 'Select model…'
  }

  function osFamilyPlaceholder() {
    if (!modelCode) return 'Choose a model first'
    if (loadingOsFamilies) return 'Loading operating systems…'
    if (osFamilies.length === 0) return 'No operating systems available'
    return 'Select operating system…'
  }

  function osVersionPlaceholder() {
    if (!osFamilyCode) return 'Choose an OS first'
    if (loadingOsVersions) return 'Loading versions…'
    if (osVersions.length === 0) return 'No versions available'
    return 'Select version…'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      {/* ── Assignment ──────────────────────────────────────────────────── */}
      {members.length > 0 && (
        <div>
          <label htmlFor="memberId" className={labelClass}>
            Assign to family member
          </label>
          <select id="memberId" {...register('memberId')} className={selectClass}>
            <option value="">Shared device (no specific owner)</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
          <p className={hintClass}>Leave unassigned for devices shared by the whole family</p>
        </div>
      )}

      {/* ── Device identification ───────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className={sectionHeadingClass}>Device identification</legend>

        {/* Device type */}
        <div>
          <label htmlFor="deviceTypeCode" className={labelClass}>
            Device type <span className="text-red-500">*</span>
            {loadingTypes && <> <InlineSpinner /></>}
          </label>
          <Controller
            name="deviceTypeCode"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                id="deviceTypeCode"
                options={deviceTypeOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder={loadingTypes ? 'Loading…' : 'Select device type…'}
              />
            )}
          />
          <p className={hintClass}>Narrows the available brands and models below</p>
          {errors.deviceTypeCode && <p className={errorClass}>{errors.deviceTypeCode.message}</p>}
        </div>

        {/* Brand + Model */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="brandCode" className={labelClass}>
              Brand <span className="text-red-500">*</span>
              {loadingBrands && <> <InlineSpinner /></>}
            </label>
            <Controller
              name="brandCode"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  id="brandCode"
                  options={brandOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={brandPlaceholder()}
                  disabled={!deviceTypeCode}
                />
              )}
            />
            {errors.brandCode && <p className={errorClass}>{errors.brandCode.message}</p>}
          </div>
          <div>
            <label htmlFor="modelCode" className={labelClass}>
              Model <span className="text-red-500">*</span>
              {loadingModels && <> <InlineSpinner /></>}
            </label>
            <Controller
              name="modelCode"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  id="modelCode"
                  options={modelOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={modelPlaceholder()}
                  disabled={!brandCode}
                />
              )}
            />
            {errors.modelCode && <p className={errorClass}>{errors.modelCode.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* ── Operating system ────────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className={sectionHeadingClass}>Operating system</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="osFamilyCode" className={labelClass}>
              OS family <span className="text-red-500">*</span>
              {loadingOsFamilies && <> <InlineSpinner /></>}
            </label>
            <Controller
              name="osFamilyCode"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  id="osFamilyCode"
                  options={osFamilyOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={osFamilyPlaceholder()}
                  disabled={!modelCode}
                />
              )}
            />
            <p className={hintClass}>Auto-selected based on the chosen model</p>
            {errors.osFamilyCode && <p className={errorClass}>{errors.osFamilyCode.message}</p>}
          </div>
          <div>
            <label htmlFor="osVersionCode" className={labelClass}>
              Version <span className="text-red-500">*</span>
              {loadingOsVersions && <> <InlineSpinner /></>}
            </label>
            <Controller
              name="osVersionCode"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  id="osVersionCode"
                  options={osVersionOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={osVersionPlaceholder()}
                  disabled={!osFamilyCode}
                />
              )}
            />
            {errors.osVersionCode && <p className={errorClass}>{errors.osVersionCode.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* ── Status & security ───────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className={sectionHeadingClass}>Status &amp; security</legend>

        {/* Support status */}
        <div>
          <label htmlFor="supportStatus" className={labelClass}>
            Support status
          </label>
          <select id="supportStatus" {...register('supportStatus')} className={selectClass}>
            {SUPPORT_STATUSES.map((s) => (
              <option key={s} value={s}>{SUPPORT_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <p className={hintClass}>Whether the manufacturer still provides security updates</p>
        </div>

        {/* Security checkboxes */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">Security features enabled</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {(
              [
                { name: 'screenLockEnabled', label: 'Screen lock', desc: 'PIN, password, or pattern' },
                { name: 'biometricEnabled', label: 'Biometrics', desc: 'Fingerprint or face unlock' },
                { name: 'backupEnabled', label: 'Cloud backup', desc: 'Automatic data backup' },
                { name: 'findMyDeviceEnabled', label: 'Find My Device', desc: 'Remote locate & wipe' },
              ] as const
            ).map(({ name, label, desc }) => (
              <label
                key={name}
                className="flex cursor-pointer items-start gap-2.5 rounded-md p-1.5 transition-colors hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  {...register(name)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <span className="block text-sm text-gray-700">{label}</span>
                  <span className="block text-xs text-gray-400">{desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {/* ── Notes ───────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register('notes')}
          className={`${selectClass} resize-none placeholder:text-gray-400`}
          placeholder="e.g. Company-issued laptop, case serial #12345…"
          maxLength={1000}
        />
        {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
