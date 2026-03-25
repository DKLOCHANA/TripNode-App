export interface NetworkError {
  type: 'NetworkError';
  message: string;
  statusCode?: number;
  retryable: boolean;
}

export function createNetworkError(
  message: string,
  options?: { statusCode?: number; retryable?: boolean }
): NetworkError {
  return {
    type: 'NetworkError',
    message,
    statusCode: options?.statusCode,
    retryable: options?.retryable ?? true,
  };
}

export function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as NetworkError).type === 'NetworkError'
  );
}
