'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ReviewsSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Schedule Review</h1>
      <p className="text-gray-600">Workspace: {slug}</p>

      <div className="pt-4">
        <Button variant="outline" onClick={() => router.push(`/workspace/${slug}/dashboard`)}>
          Back to Dashboard
        </Button>
      </div>

      <div className="mt-6 p-4 border rounded-md bg-white">
        <p className="text-gray-700">Placeholder: Review scheduling UI will go here.</p>
      </div>
    </div>
  )
}
