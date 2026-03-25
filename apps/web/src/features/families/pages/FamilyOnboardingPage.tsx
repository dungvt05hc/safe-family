import { useNavigate } from 'react-router-dom'
import { FamilyCreateForm } from '../components/FamilyCreateForm'
import { useCreateFamily } from '../hooks/useCreateFamily'

export function FamilyOnboardingPage() {
  const navigate = useNavigate()
  const createFamily = useCreateFamily()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">SafeFamily</h1>
          <p className="mt-2 text-sm text-gray-500">Set up your family profile to get started</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-gray-800">Create your family</h2>

          <FamilyCreateForm
            isSubmitting={createFamily.isPending}
            error={createFamily.error}
            onSubmit={(values) =>
              createFamily.mutate(values, {
                onSuccess: () => navigate('/dashboard', { replace: true }),
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
