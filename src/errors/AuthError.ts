export type AuthErrorCode =
  | 'TOKEN_EXPIRED'
  | 'INVALID_CREDENTIALS'
  | 'SESSION_REVOKED'
  | 'EMAIL_IN_USE'
  | 'WEAK_PASSWORD'
  | 'TOO_MANY_REQUESTS'
  | 'UNKNOWN';

export interface AuthError {
  type: 'AuthError';
  message: string;
  code: AuthErrorCode;
}

export function createAuthError(message: string, code: AuthErrorCode): AuthError {
  return {
    type: 'AuthError',
    message,
    code,
  };
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as AuthError).type === 'AuthError'
  );
}
