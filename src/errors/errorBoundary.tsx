import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import { Button } from '@/presentation/components/ui/Button';
import { GlassContainer } from '@/presentation/components/ui/GlassContainer';
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
    // Log error to console in development
    console.error('ScreenErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
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

      // Default error UI
      return (
        <View style={styles.container}>
          <GlassContainer style={styles.content}>
            <Typography variant="title3" weight="bold" align="center">
              Something went wrong
            </Typography>
            <Typography
              variant="body"
              color={colors.textSecondary}
              align="center"
              style={styles.message}
            >
              We encountered an unexpected error. Please try again.
            </Typography>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Typography variant="caption1" color={colors.error}>
                  {this.state.error.message}
                </Typography>
              </View>
            )}
            <Button
              title="Try Again"
              variant="primary"
              onPress={this.handleRetry}
              style={styles.button}
            />
          </GlassContainer>
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
  },
  message: {
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
  button: {
    minWidth: 140,
  },
});

export default ScreenErrorBoundary;
