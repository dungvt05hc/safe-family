import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from '@/lib/i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('topbar')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentCode = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2) as SupportedLanguageCode
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) ?? SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(code: SupportedLanguageCode) {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('languageSwitcher')}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <span aria-hidden="true">{current.flag}</span>
        <span className="hidden sm:inline uppercase tracking-wide text-xs font-semibold">
          {current.code}
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('languageSwitcher')}
          className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg py-1 text-sm z-50"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === current.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={cn(
                'flex w-full items-center gap-2.5 px-4 py-2.5 transition-colors',
                lang.code === current.code
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              <span aria-hidden="true" className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
