import React, { memo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { SyncItem } from '@/types/sync';
import { colors, spacing, typography } from '@/theme';
import { AppModal } from './AppModal';
import { Button } from './Button';

interface SyncStatusModalProps {
  visible: boolean;
  items: SyncItem[];
  isOnline: boolean;
  isSyncing: boolean;
  onClose: () => void;
  onSyncNow: () => void;
}

const statusLabel: Record<SyncItem['status'], string> = {
  pending: 'Pending',
  syncing: 'Syncing',
  success: 'Synced',
  error: 'Failed',
};

const statusColor: Record<SyncItem['status'], string> = {
  pending: colors.textMuted,
  syncing: colors.warning,
  success: colors.success,
  error: colors.error,
};

const SyncItemRow = memo(function SyncItemRow({ item }: { item: SyncItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowMeta}>
          {item.action.toUpperCase()} · {statusLabel[item.status]}
        </Text>
        {item.error ? (
          <Text style={styles.rowError} numberOfLines={2}>
            {item.error}
          </Text>
        ) : null}
      </View>
      <View
        style={[styles.statusDot, { backgroundColor: statusColor[item.status] }]}
      />
    </View>
  );
});

export const SyncStatusModal = memo(function SyncStatusModal({
  visible,
  items,
  isOnline,
  isSyncing,
  onClose,
  onSyncNow,
}: SyncStatusModalProps) {
  return (
    <AppModal visible={visible} title="Sync Status" onClose={onClose}>
      <Text style={styles.subtitle}>
        {isOnline
          ? 'Review tasks waiting to be synchronized with Supabase.'
          : 'You are offline. Changes are saved locally and will sync when you reconnect.'}
      </Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>All tasks are synced.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.taskId}
          renderItem={({ item }) => <SyncItemRow item={item} />}
          style={styles.list}
          ItemSeparatorComponent={Separator}
        />
      )}

      <Button
        label={isSyncing ? 'Syncing...' : 'Sync now'}
        onPress={onSyncNow}
        loading={isSyncing}
        disabled={!isOnline || items.length === 0}
        style={styles.button}
      />
    </AppModal>
  );
});

const Separator = memo(function Separator() {
  return <View style={styles.separator} />;
});

const styles = StyleSheet.create({
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  list: {
    maxHeight: 280,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...typography.label,
    color: colors.text,
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowError: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  button: {
    marginTop: spacing.sm,
  },
});
