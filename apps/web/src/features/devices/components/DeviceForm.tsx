import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef } from 'react'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { SUPPORT_STATUSES, type DeviceFormValues } from '../devices.types'
import { DEVICE_FORM_DEFAULTS } from '../devices.schema'
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
  const { t } = useTranslation('devices')

  const schema = useMemo(
    () =>
      z.object({
        memberId: z.string().optional().default(''),
        deviceTypeCode: z.string().min(1, t('validation.deviceType')),
        brandCode: z.string().min(1, t('validation.brand')),
        modelCode: z.string().min(1, t('validation.model')),
        osFamilyCode: z.string().min(1, t('validation.osFamily')),
        osVersionCode: z.string().min(1, t('validation.osVersion')),
        supportStatus: z.enum(
          ['Unknown', 'Supported', 'EndOfLife', 'NoLongerReceivingUpdates'] as const,
          { errorMap: () => ({ message: t('validation.supportStatus') }) },
        ),
        screenLockEnabled: z.boolean().default(false),
        biometricEnabled: z.boolean().default(false),
        backupEnabled: z.boolean().default(false),
        findMyDeviceEnabled: z.boolean().default(false),
        notes: z.string().max(1000, t('validation.notesMax')).optional().default(''),
      }),
    [t],
)
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(schema),
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
    if (!deviceTypeCode) return t('placeholder.brandNoType')
    if (loadingBrands) return t('placeholder.brandLoading')
    if (brands.length === 0) return t('placeholder.brandNone')
    return t('placeholder.brandDefault')
  }

  function modelPlaceholder() {
    if (!brandCode) return t('placeholder.modelNoBrand')
    if (loadingModels) return t('placeholder.modelLoading')
    if (models.length === 0) return t('placeholder.modelNone')
    return t('placeholder.modelDefault')
  }

  function osFamilyPlaceholder() {
    if (!modelCode) return t('placeholder.osFamilyNoModel')
    if (loadingOsFamilies) return t('placeholder.osFamilyLoading')
    if (osFamilies.length === 0) return t('placeholder.osFamilyNone')
    return t('placeholder.osFamilyDefault')
  }

  function osVersionPlaceholder() {
    if (!osFamilyCode) return t('placeholder.osVersionNoFamily')
    if (loadingOsVersions) return t('placeholder.osVersionLoading')
    if (osVersions.length === 0) return t('placeholder.osVersionNone')
    return t('placeholder.osVersionDefault')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      {/* ── Assignment ──────────────────────────────────────────────────── */}
      {members.length > 0 && (
        <div>
          <label htmlFor="memberId" className={labelClass}>
            {t('form.memberLabel')}
          </label>
          <select id="memberId" {...register('memberId')} className={selectClass}>
            <option value="">{t('form.memberPlaceholder')}</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
          <p className={hintClass}>{t('form.memberHint')}</p>
        </div>
      )}

      {/* ── Device identification ───────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className={sectionHeadingClass}>{t('form.sectionIdentification')}</legend>

        {/* Device type */}
        <div>
          <label htmlFor="deviceTypeCode" className={labelClass}>
            {t('form.deviceType')} <span className="text-red-500">*</span>
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
                placeholder={loadingTypes ? t('form.deviceTypeLoading') : t('form.deviceTypePlaceholder')}
              />
            )}
          />
          <p className={hintClass}>{t('form.deviceTypeHint')}</p>
          {errors.deviceTypeCode && <p className={errorClass}>{errors.deviceTypeCode.message}</p>}
        </div>

        {/* Brand + Model */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="brandCode" className={labelClass}>
              {t('form.brand')} <span className="text-red-500">*</span>
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
              {t('form.model')} <span className="text-red-500">*</span>
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
        <legend className={sectionHeadingClass}>{t('form.sectionOs')}</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="osFamilyCode" className={labelClass}>
              {t('form.osFamily')} <span className="text-red-500">*</span>
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
            <p className={hintClass}>{t('form.osFamilyHint')}</p>
            {errors.osFamilyCode && <p className={errorClass}>{errors.osFamilyCode.message}</p>}
          </div>
          <div>
            <label htmlFor="osVersionCode" className={labelClass}>
              {t('form.osVersion')} <span className="text-red-500">*</span>
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
        <legend className={sectionHeadingClass}>{t('form.sectionStatusSecurity')}</legend>

        {/* Support status */}
        <div>
          <label htmlFor="supportStatus" className={labelClass}>
            {t('form.supportStatus')}
          </label>
          <select id="supportStatus" {...register('supportStatus')} className={selectClass}>
            {SUPPORT_STATUSES.map((s) => (
              <option key={s} value={s}>{t(`supportStatus.${s}` as const)}</option>
            ))}
          </select>
          <p className={hintClass}>{t('form.supportStatusHint')}</p>
        </div>

        {/* Security checkboxes */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">{t('form.securityFeaturesLabel')}</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {(
              [
                { name: 'screenLockEnabled', label: t('form.screenLock'), desc: t('form.screenLockDesc') },
                { name: 'biometricEnabled', label: t('form.biometric'), desc: t('form.biometricDesc') },
                { name: 'backupEnabled', label: t('form.backup'), desc: t('form.backupDesc') },
                { name: 'findMyDeviceEnabled', label: t('form.findMyDevice'), desc: t('form.findMyDeviceDesc') },
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
          {t('form.notes')} <span className="text-xs font-normal text-gray-400">{t('form.notesOptional')}</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register('notes')}
          className={`${selectClass} resize-none placeholder:text-gray-400`}
          placeholder={t('form.notesPlaceholder')}
          maxLength={1000}
        />
        {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('form.cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? t('form.saving') : (submitLabel ?? t('form.save'))}
        </Button>
      </div>
    </form>
  )
}
