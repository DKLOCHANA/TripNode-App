import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import {
  validateRegisterForm,
  hasErrors,
  type FieldErrors,
} from '@/lib/validation';
import { useHaptic } from '@/hooks/useHaptic';
import { checkNetworkAndAlert } from '@/lib/network';

export function useRegisterViewModel() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { register, signInWithApple, loading, error: authError, clearError } = useAuthStore();
  const haptic = useHaptic();

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleFieldChange = useCallback(
    (field: string, setter: (val: string) => void) => (text: string) => {
      setter(text);
      clearFieldError(field);
      if (authError) clearError();
    },
    [authError, clearError, clearFieldError]
  );

  const handleCreateAccount = useCallback(async () => {
    // Check network connectivity first
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    clearError();
    const errors = validateRegisterForm(name, email, password, confirmPassword);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      haptic.error();
      return;
    }

    try {
      await register(name.trim(), email.trim(), password);
      haptic.success();
      // Navigation is handled by auth listener in root layout
    } catch {
      haptic.error();
      // Error is set in the store via DomainError
    }
  }, [name, email, password, confirmPassword, register, clearError, haptic]);

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

  const navigateToLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, []);

  return {
    // State
    name,
    email,
    password,
    confirmPassword,
    fieldErrors,
    loading,
    authError,

    // Actions
    setName: handleFieldChange('name', setName),
    setEmail: handleFieldChange('email', setEmail),
    setPassword: handleFieldChange('password', setPassword),
    setConfirmPassword: handleFieldChange('confirmPassword', setConfirmPassword),
    handleCreateAccount,
    handleAppleSignIn,
    clearError,
    navigateToLogin,
  };
}
