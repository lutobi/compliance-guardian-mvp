/**
 * Central Error Handling Service
 * 
 * Provides standardized error handling, logging, and response formatting
 * for API routes and client components.
 */

import { NextResponse } from 'next/server';

export type ErrorSource = 'api' | 'database' | 'auth' | 'validation' | 'unknown';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ApiError {
  message: string;
  code?: string;
  source: ErrorSource;
  status: number;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * Creates a standardized error response for API routes
 */
export function createErrorResponse(
  message: string,
  status = 500,
  source: ErrorSource = 'unknown',
  code?: string,
  details?: Record<string, any>
): NextResponse<ApiResponse> {
  // Log the error
  logError(message, { source, status, code, details });
  
  // Create standardized response
  return NextResponse.json({
    success: false,
    error: {
      message,
      code,
      source,
      status,
      details,
    },
    timestamp: new Date().toISOString(),
  }, { status });
}

/**
 * Creates a standardized success response for API routes
 */
export function createSuccessResponse<T>(
  data?: T,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }, { status });
}

/**
 * Handles database errors with appropriate status codes and messages
 */
export function handleDatabaseError(
  error: any,
  operation: string = 'database operation'
): NextResponse {
  // PostgreSQL error codes to readable messages
  const pgErrorMap: Record<string, { message: string, status: number }> = {
    '23505': { message: 'Duplicate entry found', status: 409 }, // unique_violation
    '23503': { message: 'Referenced record not found', status: 400 }, // foreign_key_violation
    '42P01': { message: 'Database table not found', status: 500 }, // undefined_table
    '42703': { message: 'Database column not found', status: 500 }, // undefined_column
    'PGRST116': { message: 'Record not found', status: 404 }, // Postgrest not found
  };
  
  // Extract code and message
  const code = error?.code;
  const details = {
    originalMessage: error?.message || 'Unknown database error',
    operation,
    hint: error?.hint,
  };
  
  // Get appropriate error info from map or use default
  const errorInfo = code && pgErrorMap[code] 
    ? pgErrorMap[code] 
    : { message: 'Database error', status: 500 };
  
  return createErrorResponse(
    `${errorInfo.message} during ${operation}`,
    errorInfo.status,
    'database',
    code,
    details
  );
}

/**
 * Handles validation errors
 */
export function handleValidationError(
  issues: string[] | Record<string, any>,
  entity: string = 'data'
): NextResponse {
  const details = Array.isArray(issues) 
    ? { fields: issues } 
    : issues;
  
  return createErrorResponse(
    `Invalid ${entity} provided`,
    400,
    'validation',
    'VALIDATION_ERROR',
    details
  );
}

/**
 * Handles authentication errors
 */
export function handleAuthError(
  message: string = 'Authentication required',
  code: string = 'UNAUTHENTICATED'
): NextResponse {
  return createErrorResponse(
    message,
    401,
    'auth',
    code
  );
}

/**
 * Log errors with appropriate formatting and level
 */
export function logError(message: string, context?: Record<string, any>): void {
  console.error(`[ERROR] ${message}`, context || '');
}

/**
 * General purpose logger with different levels
 */
export function log(level: LogLevel, message: string, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${level.toUpperCase()}] [${timestamp}] ${message}`;
  
  switch (level) {
    case 'debug':
      console.debug(formattedMessage, context || '');
      break;
    case 'info':
      console.info(formattedMessage, context || '');
      break;
    case 'warn':
      console.warn(formattedMessage, context || '');
      break;
    case 'error':
      console.error(formattedMessage, context || '');
      break;
  }
}
