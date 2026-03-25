export interface NotFoundError {
  type: 'NotFoundError';
  message: string;
  resourceId?: string;
}

export function createNotFoundError(
  message: string,
  resourceId?: string
): NotFoundError {
  return {
    type: 'NotFoundError',
    message,
    resourceId,
  };
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as NotFoundError).type === 'NotFoundError'
  );
}
