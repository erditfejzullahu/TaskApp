import React, { memo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Task } from '@/types/task';
import { formatDateTime } from '@/utils/date';
import { colors, spacing, typography } from '@/theme';
import { AppIcon } from '@/components/common/AppIcon';
import { SyncBadge } from './SyncBadge';

interface TaskDetailModalProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (taskId: string) => void;
}

const DetailRow = memo(function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.rowLabel}>{label}</Text>
      <Text style={detailStyles.rowValue}>{value}</Text>
    </View>
  );
});

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export const TaskDetailModal = memo(function TaskDetailModal({
  task,
  visible,
  onClose,
  onEdit,
}: TaskDetailModalProps) {
  if (!visible || !task) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible
      onRequestClose={onClose}>
      <View style={styles.container}>

        {/* Header bar */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <AppIcon name="close" size={22} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.headerTitle}>Task Details</Text>
          <Pressable
            onPress={() => {
              onClose();
              onEdit(task.id);
            }}
            style={styles.editButton}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Status chip */}
          <View style={styles.statusRow}>
            <View style={[
              styles.statusChip,
              task.completed ? styles.statusDone : styles.statusActive,
            ]}>
              <AppIcon
                name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={task.completed ? '#15803D' : colors.primary}
              />
              <Text style={[
                styles.statusText,
                task.completed ? styles.statusTextDone : styles.statusTextActive,
              ]}>
                {task.completed ? 'Completed' : 'Active'}
              </Text>
            </View>
            <SyncBadge synced={task.synced} />
          </View>

          {/* Title */}
          <Text style={[
            styles.title,
            task.completed && styles.titleCompleted,
          ]}>
            {task.title}
          </Text>

          {/* Description */}
          {task.description ? (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.description}>{task.description}</Text>
            </View>
          ) : (
            <View style={styles.descriptionCard}>
              <Text style={styles.noDescription}>No description added.</Text>
            </View>
          )}

          {/* Meta info */}
          <View style={styles.metaCard}>
            <DetailRow label="Created" value={formatDateTime(task.createdAt)} />
            <View style={styles.metaDivider} />
            <DetailRow label="Updated" value={formatDateTime(task.updatedAt)} />
            <View style={styles.metaDivider} />
            <DetailRow
              label="Cloud sync"
              value={task.synced ? 'Synced' : 'Pending sync'}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.label,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  editText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: colors.primaryLight,
  },
  statusDone: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  statusTextActive: {
    color: colors.primary,
  },
  statusTextDone: {
    color: '#15803D',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    lineHeight: 32,
    marginTop: spacing.sm,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  descriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  noDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
