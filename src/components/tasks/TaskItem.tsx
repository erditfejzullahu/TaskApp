import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Task } from '@/types/task';
import { useRelativeTime } from '@/hooks/useRelativeTime';
import { colors, spacing, typography } from '@/theme';
import { AppIcon } from '@/components/common/AppIcon';
import { SyncBadge } from './SyncBadge';

interface TaskItemProps {
  task: Task;
  onPress: (taskId: string) => void;
  onMenuPress: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  isToggling?: boolean;
}

export const TaskItem = memo(function TaskItem({
  task,
  onPress,
  onMenuPress,
  onToggleComplete,
  isToggling = false,
}: TaskItemProps) {
  const handlePress = useCallback(() => onPress(task.id), [onPress, task.id]);
  const handleMenu = useCallback(
    () => onMenuPress(task.id),
    [onMenuPress, task.id],
  );
  const handleToggle = useCallback(
    () => onToggleComplete(task.id),
    [onToggleComplete, task.id],
  );
  const createdLabel = useRelativeTime(task.createdAt);

  return (
    <View style={styles.card}>
      {/* Checkbox — isolated touch target */}
      <Pressable
        onPress={handleToggle}
        disabled={isToggling}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        style={({ pressed }) => [
          styles.checkbox,
          task.completed && styles.checkboxChecked,
          isToggling && styles.checkboxToggling,
          pressed && styles.checkboxPressed,
        ]}>
        {task.completed ? (
          <AppIcon name="checkmark" size={14} color={colors.surface} />
        ) : null}
      </Pressable>

      {/* Content — tap opens detail modal */}
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.content, pressed && styles.contentPressed]}>
        <Text
          style={[styles.title, task.completed && styles.titleCompleted]}
          numberOfLines={1}>
          {task.title}
        </Text>

        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.date}>{createdLabel}</Text>
          <SyncBadge synced={task.synced} />
        </View>
      </Pressable>

      {/* Menu — isolated touch target */}
      <Pressable
        onPress={handleMenu}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={({ pressed }) => [
          styles.menuButton,
          pressed && styles.menuButtonPressed,
        ]}>
        <AppIcon name="ellipsis-vertical" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxToggling: {
    opacity: 0.45,
  },
  checkboxPressed: {
    opacity: 0.75,
  },
  content: {
    flex: 1,
    gap: 4,
    borderRadius: 8,
    paddingVertical: 2,
  },
  contentPressed: {
    opacity: 0.7,
  },
  title: {
    ...typography.label,
    fontSize: 15,
    color: colors.text,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuButtonPressed: {
    backgroundColor: colors.border,
  },
});
