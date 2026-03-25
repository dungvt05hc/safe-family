import { PageLayout } from '@/components/layout/PageLayout'

export function HomePage() {
  return (
    <PageLayout
      title="Welcome to SafeFamily"
      description="Keep your family safe and connected."
    >
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500 text-sm">Your features will appear here as they are built.</p>
      </div>
    </PageLayout>
  )
}
