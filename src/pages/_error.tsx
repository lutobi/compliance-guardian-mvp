import { NextPageContext } from 'next';
import ErrorBoundary from '@/components/error-boundary';

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

function Error({ statusCode, message }: ErrorProps) {
  const error = new Error(message || 'An unexpected error occurred');
  return (
    <ErrorBoundary
      error={error}
      reset={() => window.location.reload()}
    />
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
