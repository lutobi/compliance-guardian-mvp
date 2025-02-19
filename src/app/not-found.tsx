import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 p-4 text-center">
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
