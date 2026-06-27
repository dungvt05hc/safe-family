import type { ReactNode } from 'react'

interface InfoSectionProps {
  /** Element id assigned to the heading — referenced by aria-labelledby on the section. */
  id: string
  heading: string
  children: ReactNode
  /**
   * When provided, renders a numbered "N." prefix before the heading and
   * indents the section body. Pass the zero-based array index; the rendered
   * number is index + 1.
   */
  index?: number
  /** When true, renders a <hr> divider above this section. */
  divider?: boolean
}

/**
 * Reusable section block for informational pages.
 *
 * Two modes:
 * - Plain (no index): bare heading + content, for general info sections.
 * - Numbered (with index): "N." prefix + indented body, for policy pages.
 *
 * @example Numbered section (Privacy / Terms):
 *   <InfoSection id="privacy-collect" heading="What We Collect" index={0}>
 *     <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
 *   </InfoSection>
 *
 * @example Plain section (About / Contact):
 *   <InfoSection id="about-mission" heading="Our Mission">
 *     <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
 *   </InfoSection>
 */
export function InfoSection({ id, heading, children, index, divider = false }: InfoSectionProps) {
  const numbered = index !== undefined

  return (
    <section aria-labelledby={id}>
      {divider && <hr className="border-gray-100 my-7" />}
      <h2
        id={id}
        className={
          numbered
            ? 'flex items-baseline gap-2.5 text-sm font-semibold text-gray-900 mb-2'
            : 'text-sm font-semibold text-gray-900 mb-2'
        }
      >
        {numbered && (
          <span className="text-blue-500 font-bold tabular-nums w-4 shrink-0">
            {index + 1}.
          </span>
        )}
        {heading}
      </h2>
      <div className={numbered ? 'pl-[1.625rem]' : undefined}>
        {children}
      </div>
    </section>
  )
}
