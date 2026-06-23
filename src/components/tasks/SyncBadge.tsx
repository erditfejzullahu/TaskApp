import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/theme';

interface SyncBadgeProps {
  synced: boolean;
}

export const SyncBadge = memo(function SyncBadge({ synced }: SyncBadgeProps) {
  return (
    <View style={[styles.container, synced ? styles.syncedBg : styles.pendingBg]}>
      <View style={[styles.dot, synced ? styles.syncedDot : styles.pendingDot]} />
      <Text style={[styles.label, synced ? styles.syncedText : styles.pendingText]}>
        {synced ? 'Synced' : 'Local'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  syncedBg: {
    backgroundColor: '#DCFCE7',
  },
  pendingBg: {
    backgroundColor: '#FEF3C7',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncedDot: {
    backgroundColor: colors.success,
  },
  pendingDot: {
    backgroundColor: colors.warning,
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  syncedText: {
    color: '#15803D',
  },
  pendingText: {
    color: '#92400E',
  },
});
