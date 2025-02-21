import { NextPageContext } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

function Error({ statusCode, message }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">{statusCode || 'Error'}</h1>
          <h2 className="text-3xl font-semibold text-gray-800">Something went wrong</h2>
          <p className="text-gray-600">
            {message || 'An unexpected error occurred. Please try again later.'}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-x-4">
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Need help? Try these pages:
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
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  const message = err?.message;
  return { statusCode, message };
};

export default Error;
