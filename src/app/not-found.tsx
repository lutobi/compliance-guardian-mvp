import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-x-4">
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Lost? Try visiting one of these popular pages:
          </p>
          <div className="space-y-2 text-sm">
            <Link href="/frameworks" className="block text-blue-600 hover:underline">
              Compliance Frameworks
            </Link>
            <Link href="/monitoring" className="block text-blue-600 hover:underline">
              Monitoring Setup
            </Link>
            <Link href="/auth/login" className="block text-blue-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
