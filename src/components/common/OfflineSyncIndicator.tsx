import React, { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '@/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface OfflineSyncIndicatorProps {
  unsyncedCount: number;
  onPress: () => void;
  isSyncing: boolean;
}

export const OfflineSyncIndicator = memo(function OfflineSyncIndicator({
  unsyncedCount,
  onPress,
  isSyncing,
}: OfflineSyncIndicatorProps) {
  const { isOnline } = useNetworkStatus();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (unsyncedCount > 0) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [unsyncedCount, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (unsyncedCount === 0 && isOnline) {
    return null;
  }

  const label = !isOnline
    ? 'Offline'
    : isSyncing
      ? 'Syncing...'
      : `${unsyncedCount} pending`;

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      <Animated.View
        style={[
          styles.badge,
          !isOnline ? styles.offline : styles.pending,
          animatedStyle,
        ]}>
        <View style={[styles.dot, !isOnline ? styles.dotOffline : styles.dotPending]} />
        <Text style={styles.text}>{label}</Text>
        {unsyncedCount > 0 ? (
          <View style={styles.countBubble}>
            <Text style={styles.count}>{unsyncedCount}</Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginRight: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  offline: {
    backgroundColor: colors.offlineLight,
  },
  pending: {
    backgroundColor: colors.warningLight,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOffline: {
    backgroundColor: colors.offline,
  },
  dotPending: {
    backgroundColor: colors.warning,
  },
  text: {
    ...typography.caption,
    color: colors.text,
  },
  countBubble: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  count: {
    ...typography.caption,
    color: colors.surface,
    fontSize: 11,
  },
});
