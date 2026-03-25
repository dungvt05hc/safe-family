interface PageLayoutProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

/**
 * PageLayout — wraps individual page content with a consistent header.
 * Use inside feature pages:
 *   <PageLayout title="Family Members">...</PageLayout>
 */
export function PageLayout({ title, description, action, children }: PageLayoutProps) {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {children}
    </div>
  )
}
