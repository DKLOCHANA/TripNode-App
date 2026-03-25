import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from '@/data/sources/remote/firebase/auth';
import { validateForgotPasswordForm, hasErrors, type FieldErrors } from '@/lib/validation';
import { useHaptic } from '@/hooks/useHaptic';
import { normalizeFirebaseError, type DomainError } from '@/errors/DomainError';
import { checkNetworkAndAlert } from '@/lib/network';

export function useForgotPasswordViewModel() {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DomainError | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const haptic = useHaptic();

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      clearFieldError('email');
      if (error) clearError();
    },
    [error, clearError, clearFieldError]
  );

  const handleSubmit = useCallback(async () => {
    // Check network connectivity first
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    clearError();
    const errors = validateForgotPasswordForm(email);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      haptic.error();
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(email.trim());
      haptic.success();
      setEmailSent(true);
    } catch (err: any) {
      haptic.error();
      setError(normalizeFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }, [email, clearError, haptic]);

  const navigateBack = useCallback(() => {
    router.back();
  }, []);

  const navigateToLogin = useCallback(() => {
    router.replace('/(auth)/login');
  }, []);

  return {
    // State
    email,
    fieldErrors,
    loading,
    error,
    emailSent,

    // Actions
    handleEmailChange,
    handleSubmit,
    clearError,
    navigateBack,
    navigateToLogin,
  };
}
