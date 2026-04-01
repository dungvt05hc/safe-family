import { useState, useRef, useEffect, useCallback } from 'react'

interface Option {
  value: string
  label: string
}

interface Props {
  id?: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** When true, if the typed text doesn't match any option the raw text is used as value. */
  allowCustom?: boolean
  customLabel?: string
  className?: string
}

const baseClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  allowCustom = false,
  customLabel = 'Other (type below)',
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customMode, setCustomMode] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Derive display text from the current value
  const displayText =
    options.find((o) => o.value === value)?.label ?? (value || '')

  // Filter options by search
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  )

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
        setCustomMode(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val)
      setOpen(false)
      setSearch('')
      setCustomMode(false)
    },
    [onChange],
  )

  const handleCustom = useCallback(() => {
    setCustomMode(true)
    setSearch('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const handleCustomConfirm = useCallback(() => {
    if (search.trim()) {
      onChange(search.trim())
    }
    setOpen(false)
    setSearch('')
    setCustomMode(false)
  }, [search, onChange])

  // Keyboard: Enter confirms custom, Escape closes
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setSearch('')
        setCustomMode(false)
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (customMode && search.trim()) {
          handleCustomConfirm()
        } else if (filtered.length === 1) {
          handleSelect(filtered[0].value)
        }
      }
    },
    [customMode, search, filtered, handleCustomConfirm, handleSelect],
  )

  if (disabled) {
    return (
      <div className={`${baseClass} cursor-not-allowed bg-gray-100 text-gray-500 ${className ?? ''}`}>
        {displayText || <span className="text-gray-400">{placeholder}</span>}
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ''}`}>
      {/* Trigger / search input */}
      <button
        type="button"
        id={id}
        className={`${baseClass} flex items-center justify-between text-left`}
        onClick={() => {
          setOpen((prev) => !prev)
          setSearch('')
          setCustomMode(false)
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {displayText || placeholder}
        </span>
        <svg className="ml-2 h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Search box */}
          <div className="border-b border-gray-100 p-2">
            <input
              ref={inputRef}
              type="text"
              className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={customMode ? 'Type a custom value…' : 'Search…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          {customMode ? (
            <div className="p-2">
              <button
                type="button"
                className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={!search.trim()}
                onClick={handleCustomConfirm}
              >
                Use "{search.trim() || '…'}"
              </button>
            </div>
          ) : (
            <ul
              role="listbox"
              className="max-h-48 overflow-y-auto py-1"
            >
              {filtered.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  className={`cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-blue-50 ${
                    opt.value === value ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </li>
              ))}
              {filtered.length === 0 && !allowCustom && (
                <li className="px-3 py-2 text-sm text-gray-400">No results found</li>
              )}
              {allowCustom && (
                <li
                  role="option"
                  aria-selected={false}
                  className="cursor-pointer border-t border-gray-100 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
                  onClick={handleCustom}
                >
                  {customLabel}
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
