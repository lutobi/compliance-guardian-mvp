/**
 * API response utilities for consistent response format
 */
import { NextResponse } from 'next/server';

export type ErrorSourceType = 'validation' | 'auth' | 'database' | 'server' | 'client';

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    source: ErrorSourceType;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Creates a standardized success response
 * @param data The data to include in the response
 * @param headers Optional headers to include in the response
 * @returns NextResponse with success wrapper
 */
export function createSuccessResponse<T>(data: T, headers?: HeadersInit): NextResponse {
  const responseBody: ApiSuccessResponse<T> = {
    success: true,
    data
  };
  
  return NextResponse.json(responseBody, { status: 200, headers });
}

/**
 * Creates a standardized error response
 * @param message Error message
 * @param status HTTP status code
 * @param source Source of the error (validation, auth, database, server)
 * @param code Optional error code for client reference
 * @param headers Optional headers to include in the response
 * @returns NextResponse with error wrapper
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  source: ErrorSourceType = 'server',
  code?: string,
  headers?: HeadersInit
): NextResponse {
  const responseBody: ApiErrorResponse = {
    success: false,
    error: {
      message,
      source,
      ...(code && { code })
    }
  };
  
  return NextResponse.json(responseBody, { status, headers });
}
