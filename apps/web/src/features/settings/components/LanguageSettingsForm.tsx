import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useLanguagePreference } from '../settings.hooks'

export function LanguageSettingsForm() {
  const { currentCode, setLanguage, languages } = useLanguagePreference()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-500">
          Choose the language used throughout the app. Your preference is saved
          locally and will be remembered on this device.
        </p>

        <div
          role="radiogroup"
          aria-label="App language"
          className="flex flex-col gap-2 sm:flex-row"
        >
          {languages.map((lang) => {
            const isSelected = lang.code === currentCode
            return (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  'flex flex-1 items-center justify-between gap-3 rounded-xl border px-4 py-3',
                  'text-sm font-medium transition-colors focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base" aria-hidden="true">
                    {lang.flag}
                  </span>
                  {lang.label}
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
