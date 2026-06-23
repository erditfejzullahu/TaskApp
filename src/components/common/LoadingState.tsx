import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = memo(function LoadingState({
  message = 'Loading tasks...',
}: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
});

interface InlineLoaderProps {
  label?: string;
}

export const InlineLoader = memo(function InlineLoader({
  label,
}: InlineLoaderProps) {
  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={colors.primary} />
      {label ? <Text style={styles.inlineLabel}>{label}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  inlineLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
