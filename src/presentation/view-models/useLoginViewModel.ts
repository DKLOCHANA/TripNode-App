import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { validateLoginForm, hasErrors, type FieldErrors } from '@/lib/validation';
import { useHaptic } from '@/hooks/useHaptic';
import { checkNetworkAndAlert } from '@/lib/network';

export function useLoginViewModel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { signIn, signInWithApple, loading, error: authError, clearError } = useAuthStore();
  const haptic = useHaptic();

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      clearFieldError('email');
      if (authError) clearError();
    },
    [authError, clearError, clearFieldError]
  );

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      clearFieldError('password');
      if (authError) clearError();
    },
    [authError, clearError, clearFieldError]
  );

  const handleSignIn = useCallback(async () => {
    // Check network connectivity first
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    clearError();
    const errors = validateLoginForm(email, password);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      haptic.error();
      return;
    }

    try {
      await signIn(email.trim(), password);
      haptic.success();
      // Navigation is handled by auth listener in root layout
    } catch {
      haptic.error();
      // Error is set in the store via DomainError
    }
  }, [email, password, signIn, clearError, haptic]);

  const handleAppleSignIn = useCallback(async () => {
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    clearError();
    try {
      await signInWithApple();
      haptic.success();
    } catch {
      haptic.error();
    }
  }, [signInWithApple, clearError, haptic]);

  const navigateToRegister = useCallback(() => {
    router.push('/(auth)/register');
  }, []);

  const navigateToForgotPassword = useCallback(() => {
    router.push('/(auth)/forgot-password');
  }, []);

  const navigateBack = useCallback(() => {
    router.back();
  }, []);

  return {
    // State
    email,
    password,
    fieldErrors,
    loading,
    authError,

    // Actions
    handleEmailChange,
    handlePasswordChange,
    handleSignIn,
    handleAppleSignIn,
    clearError,
    navigateToRegister,
    navigateToForgotPassword,
    navigateBack,
  };
}
