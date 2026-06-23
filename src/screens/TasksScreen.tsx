import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { CompletionFilter, Task } from '@/types/task';
import { colors, spacing, typography } from '@/theme';
import { useTasks } from '@/hooks/useTasks';
import { useFilteredTasks } from '@/hooks/useFilteredTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSyncStore } from '@/store/syncStore';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterTabs } from '@/components/common/FilterTabs';
import { InlineLoader } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { OfflineSyncIndicator } from '@/components/common/OfflineSyncIndicator';
import { SyncStatusModal } from '@/components/common/SyncStatusModal';
import { ToastPopup } from '@/components/common/ToastPopup';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { TaskActionMenu } from '@/components/tasks/TaskActionMenu';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { useTaskStore } from '@/store/taskStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

interface HeaderActionsProps {
  unsyncedCount: number;
  isSyncing: boolean;
  onOpenSyncModal: () => void;
  onCreateTask: () => void;
}

const HeaderActions = ({
  unsyncedCount,
  isSyncing,
  onOpenSyncModal,
  onCreateTask,
}: HeaderActionsProps) => (
  <View style={styles.headerActions}>
    <OfflineSyncIndicator
      unsyncedCount={unsyncedCount}
      onPress={onOpenSyncModal}
      isSyncing={isSyncing}
    />
    <Pressable onPress={onCreateTask} style={styles.addButton}>
      <Text style={styles.addButtonText}>+ New</Text>
    </Pressable>
  </View>
);

export function TasksScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<CompletionFilter>('all');
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listKey, setListKey] = useState(0);

  const { tasks, unsyncedCount } = useTasks();
  const {
    tasks: filteredTasks,
    isProcessing,
    showEmptyState,
    refetch: refetchFiltered,
  } = useFilteredTasks(tasks, searchQuery, filter);
  const { toggleMutation, deleteMutation } = useTaskMutations();
  const { isOnline } = useNetworkStatus();
  const {
    isLoading,
    isError,
    error,
    refetch,
    openSyncModal,
    closeSyncModal,
    syncNow,
    isSyncing,
    refetchTasks,
  } = useAppBootstrap();

  // After returning from create/edit the native Modal layer or keyboard resize
  // can leave touch targets misaligned until a full remount — search "fixed" it
  // because it forced this same reset path.
  useFocusEffect(
    useCallback(() => {
      Keyboard.dismiss();
      setDetailVisible(false);
      setMenuVisible(false);
      setListKey(k => k + 1);
    }, []),
  );

  // Single subscription for all sync UI state
  const { syncModalVisible, syncItems, toastVisible, toastType, toastMessage, hideToast } =
    useSyncStore(
      useShallow(state => ({
        syncModalVisible: state.syncModalVisible,
        syncItems: state.syncItems,
        toastVisible: state.toastVisible,
        toastType: state.toastType,
        toastMessage: state.toastMessage,
        hideToast: state.hideToast,
      })),
    );

  const computedTask: Task | null = useMemo(
    () =>
      filteredTasks.find(t => t.id === selectedTaskId) ??
      tasks.find(t => t.id === selectedTaskId) ??
      null,
    [filteredTasks, tasks, selectedTaskId],
  );

  // Keep the last non-null task in a ref so modals don't unmount mid-interaction
  // when a store merge briefly causes selectedTask to resolve to null.
  const selectedTaskRef = useRef<Task | null>(null);
  if (computedTask) {
    selectedTaskRef.current = computedTask;
  }
  const selectedTask = detailVisible || menuVisible
    ? (computedTask ?? selectedTaskRef.current)
    : computedTask;

  const handleCreateTask = useCallback(
    () => navigation.navigate('CreateTask'),
    [navigation],
  );

  const headerRight = useMemo(
    () => (
      <HeaderActions
        unsyncedCount={unsyncedCount}
        isSyncing={isSyncing}
        onOpenSyncModal={openSyncModal}
        onCreateTask={handleCreateTask}
      />
    ),
    [unsyncedCount, isSyncing, openSyncModal, handleCreateTask],
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: () => headerRight });
  }, [navigation, headerRight]);

  // Card tap → detail modal
  const handlePressTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailVisible(true);
  }, []);

  // Three-dot button → action menu (read task from store for instant open)
  const handleMenuPress = useCallback((taskId: string) => {
    const task = useTaskStore.getState().getTaskById(taskId);
    if (!task) {
      return;
    }
    setSelectedTaskId(taskId);
    setMenuVisible(true);
  }, []);

  // Edit (from detail modal or action menu) → navigate
  const handleEditTask = useCallback(
    (taskId: string) => {
      navigation.navigate('UpdateTask', { taskId });
    },
    [navigation],
  );

  const handleToggleComplete = useCallback(
    async (taskId: string) => {
      setTogglingTaskId(taskId);
      try {
        await toggleMutation.mutateAsync(taskId);
      } finally {
        setTogglingTaskId(null);
      }
    },
    [toggleMutation.mutateAsync],
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      deleteMutation.mutate(taskId);
    },
    [deleteMutation.mutate],
  );

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchTasks();
      if (isOnline) {
        await refetchFiltered();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchTasks, refetchFiltered, isOnline]);

  const emptyCopy = useMemo(() => {
    if (searchQuery.trim()) {
      return {
        title: 'No matching tasks',
        description: 'Try a different search term or clear the field.',
      };
    }
    if (filter === 'completed') {
      return {
        title: 'No completed tasks',
        description: 'Complete a task to see it here.',
      };
    }
    if (filter === 'active') {
      return {
        title: 'No active tasks',
        description: 'All caught up! Create a new task when ready.',
      };
    }
    return undefined;
  }, [searchQuery, filter]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Failed to load tasks.'
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <SearchInput value={searchQuery} onChangeText={setSearchQuery} />
      <FilterTabs value={filter} onChange={setFilter} />

      {isProcessing ? (
        <InlineLoader
          label={isOnline ? 'Searching...' : 'Filtering...'}
        />
      ) : null}

      <TaskList
        key={listKey}
        tasks={filteredTasks}
        onPressTask={handlePressTask}
        onMenuPressTask={handleMenuPress}
        onToggleComplete={handleToggleComplete}
        togglingTaskId={togglingTaskId}
        emptyTitle={emptyCopy?.title}
        emptyDescription={emptyCopy?.description}
        showEmptyState={showEmptyState}
        refreshing={isRefreshing}
        onRefresh={isOnline ? handleRefresh : undefined}
      />

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        visible={detailVisible}
        onClose={handleCloseDetail}
        onEdit={handleEditTask}
      />

      {/* Action menu (three-dot) */}
      <TaskActionMenu
        task={selectedTask}
        visible={menuVisible}
        onClose={handleCloseMenu}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onToggle={handleToggleComplete}
      />

      {/* Sync status modal */}
      <SyncStatusModal
        visible={syncModalVisible}
        items={syncItems}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onClose={closeSyncModal}
        onSyncNow={syncNow}
      />

      <ToastPopup
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 13,
  },
});
