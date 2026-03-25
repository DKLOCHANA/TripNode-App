import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Screen-level error boundary that catches rendering errors
 * and displays a recovery UI
 */
export class ScreenErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error(
      '%c[ERROR BOUNDARY]',
      'color: red; font-weight: bold;',
      {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }
    );

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to external service can be added here later (Sentry, etc.)
    // captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI - using only basic React Native components (no dependencies on providers)
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>We encountered an unexpected error. Please try again.</Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}
            <Pressable style={styles.button} onPress={this.handleRetry}>
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screen,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorDetails: {
    backgroundColor: colors.errorDim,
    padding: spacing.sm,
    borderRadius: spacing.xs,
    marginBottom: spacing.md,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
  },
  button: {
    minWidth: 140,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.electricBlue,
    borderRadius: spacing.sm,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default ScreenErrorBoundary;
