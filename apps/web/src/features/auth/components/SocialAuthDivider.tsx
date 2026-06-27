import { useTranslation } from 'react-i18next'

interface SocialAuthDividerProps {
  /** Override the centre label. Defaults to the `orContinueWith` i18n string. */
  text?: string
}

export function SocialAuthDivider({ text }: SocialAuthDividerProps) {
  const { t } = useTranslation('auth')

  return (
    <div className="relative my-5" aria-hidden="true">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs font-medium text-gray-400">
          {text ?? t('orContinueWith')}
        </span>
      </div>
    </div>
  )
}
