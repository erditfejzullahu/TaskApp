import React, { memo, useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { Task } from '@/types/task';
import { colors, spacing } from '@/theme';
import { EmptyState } from '@/components/common/EmptyState';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onPressTask: (taskId: string) => void;
  onMenuPressTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  togglingTaskId?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  showEmptyState?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const TaskList = memo(function TaskList({
  tasks,
  onPressTask,
  onMenuPressTask,
  onToggleComplete,
  togglingTaskId,
  emptyTitle = 'No tasks yet',
  emptyDescription = 'Tap "+ New" to create your first task.',
  showEmptyState = true,
  refreshing = false,
  onRefresh,
}: TaskListProps) {
  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item }) => (
      <TaskItem
        task={item}
        onPress={onPressTask}
        onMenuPress={onMenuPressTask}
        onToggleComplete={onToggleComplete}
        isToggling={togglingTaskId === item.id}
      />
    ),
    [onPressTask, onMenuPressTask, onToggleComplete, togglingTaskId],
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
    />
  ) : undefined;

  if (tasks.length === 0 && showEmptyState) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyScroll}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </ScrollView>
    );
  }

  if (tasks.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyScroll}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    );
  }

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
      extraData={tasks}
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      windowSize={7}
    />
  );
});

const styles = StyleSheet.create({
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  emptyScroll: {
    flexGrow: 1,
  },
});
