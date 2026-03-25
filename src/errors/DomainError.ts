// Re-export individual error types
export { NetworkError, isNetworkError, createNetworkError } from './NetworkError';
export { AuthError, AuthErrorCode, isAuthError, createAuthError } from './AuthError';
export { ValidationError, isValidationError, createValidationError } from './ValidationError';
export { NotFoundError, isNotFoundError, createNotFoundError } from './NotFoundError';

// Import types for union
import type { NetworkError } from './NetworkError';
import type { AuthError } from './AuthError';
import type { ValidationError } from './ValidationError';
import type { NotFoundError } from './NotFoundError';

/**
 * Union type of all domain errors
 */
export type DomainError =
  | NetworkError
  | AuthError
  | ValidationError
  | NotFoundError;

export function isDomainError(error: unknown): error is DomainError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as DomainError).type === 'string'
  );
}

export function normalizeFirebaseError(firebaseCode: string): AuthError | NetworkError {
  switch (firebaseCode) {
    case 'auth/email-already-in-use':
      return {
        type: 'AuthError',
        message: 'This email is already registered.',
        code: 'EMAIL_IN_USE',
      };
    case 'auth/invalid-email':
      return {
        type: 'AuthError',
        message: 'Please enter a valid email address.',
        code: 'INVALID_CREDENTIALS',
      };
    case 'auth/weak-password':
      return {
        type: 'AuthError',
        message: 'Password should be at least 6 characters.',
        code: 'WEAK_PASSWORD',
      };
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        type: 'AuthError',
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS',
      };
    case 'auth/too-many-requests':
      return {
        type: 'AuthError',
        message: 'Too many attempts. Please try again later.',
        code: 'TOO_MANY_REQUESTS',
      };
    case 'auth/network-request-failed':
      return {
        type: 'NetworkError',
        message: 'No internet connection. Please check your network and try again.',
        retryable: true,
      };
    case 'auth/requires-recent-login':
      return {
        type: 'AuthError',
        message: 'Please sign in again to continue.',
        code: 'SESSION_REVOKED',
      };
    default:
      return {
        type: 'AuthError',
        message: 'Something went wrong. Please try again.',
        code: 'UNKNOWN',
      };
  }
}
