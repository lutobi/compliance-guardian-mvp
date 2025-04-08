import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const safeOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    console.error(error)
    throw new Error(errorMessage)
  }
}

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }
  
  // Reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Assume localhost
  return `http://localhost:${process.env.PORT || 3000}`;
}
