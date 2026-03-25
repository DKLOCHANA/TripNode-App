/**
 * Sanitize user input before sending to AI or API endpoints.
 * Strips potentially dangerous characters and enforces length limits.
 */
export function sanitizeTextInput(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // strip angle brackets (basic XSS prevention)
    .replace(/\n{3,}/g, '\n\n') // collapse excessive newlines
    .slice(0, maxLength); // enforce hard max length
}

/**
 * Sanitize a destination name for safe display and API use
 */
export function sanitizeDestination(name: string): string {
  return sanitizeTextInput(name, 200);
}

/**
 * Sanitize budget input - ensure it's a valid positive number
 */
export function sanitizeBudget(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return null;
  return Math.round(num * 100) / 100; // Round to 2 decimal places
}
