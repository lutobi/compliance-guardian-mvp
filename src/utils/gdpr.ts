import { addMonths } from 'date-fns';

/**
 * Computes the GDPR response due date.
 * @param receivedAt Date when the request was received.
 * @param extended Whether a two-month extension is applied.
 * @returns The due date for responding to the request.
 */
export function computeGdprResponseDueDate(
  receivedAt: Date,
  extended: boolean = false
): Date {
  // Standard deadline is 1 month; with extension it's 3 months total
  return addMonths(receivedAt, extended ? 3 : 1);
}

/**
 * Checks if a response was sent within the GDPR deadline.
 * @param receivedAt Date when the request was received.
 * @param respondedAt Date when the response was sent.
 * @param extended Whether a two-month extension is applied.
 * @returns True if the response was on or before the due date.
 */
export function isGdprResponseTimely(
  receivedAt: Date,
  respondedAt: Date,
  extended: boolean = false
): boolean {
  const dueDate = computeGdprResponseDueDate(receivedAt, extended);
  return respondedAt.getTime() <= dueDate.getTime();
}
