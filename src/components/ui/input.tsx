import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({
  className = '',
  error,
  type = 'text',
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
