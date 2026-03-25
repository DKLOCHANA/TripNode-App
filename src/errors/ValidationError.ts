export interface ValidationError {
  type: 'ValidationError';
  message: string;
  field?: string;
}

export function createValidationError(
  message: string,
  field?: string
): ValidationError {
  return {
    type: 'ValidationError',
    message,
    field,
  };
}

export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as ValidationError).type === 'ValidationError'
  );
}
