import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/config/env';
import { FILTERED_TASKS_KEY } from '@/hooks/useFilteredTasks';
import { performSync } from '@/services/syncOrchestrator';
import { taskService } from '@/services/taskService';
import { useSyncStore } from '@/store/syncStore';
import { useTaskStore } from '@/store/taskStore';
import { getSyncAction } from '@/utils/taskMapper';
import { useNetworkStatus } from './useNetworkStatus';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const useSync = () => {
  const queryClient = useQueryClient();
  const { isOnline, isReady } = useNetworkStatus();
  const wasOfflineRef = useRef(false);
  const lastMergedDataRef = useRef<unknown>(null);

  const unsyncedCount = useTaskStore(
    state => state.tasks.filter(task => !task.synced).length,
  );

  const tasksQuery = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: taskService.fetchAll,
    enabled: isReady && isOnline && isSupabaseConfigured(),
    // staleTime: 30_000,
  });

  useEffect(() => {
    if (!tasksQuery.data || tasksQuery.data === lastMergedDataRef.current) {
      return;
    }

    lastMergedDataRef.current = tasksQuery.data;
    useTaskStore.getState().mergeRemoteTasks(tasksQuery.data);
  }, [tasksQuery.data]);

  const syncMutation = useMutation({
    mutationFn: () => performSync(queryClient),
  });

  const syncNow = useCallback(async () => {
    if (!isOnline || !isSupabaseConfigured()) {
      return;
    }
    await syncMutation.mutateAsync();
  }, [isOnline, syncMutation.mutateAsync]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isOnline) {
      wasOfflineRef.current = true;
      return;
    }

    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      syncNow();
    }
  }, [isOnline, isReady, syncNow]);

  const openSyncModal = useCallback(() => {
    const pending = useTaskStore.getState().getUnsyncedTasks();
    const { setSyncItems, setSyncModalVisible } = useSyncStore.getState();

    setSyncItems(
      pending.map(task => ({
        taskId: task.id,
        title: task.title,
        action: getSyncAction(task),
        status: 'pending',
      })),
    );
    setSyncModalVisible(true);
  }, []);

  const closeSyncModal = useCallback(() => {
    const { setSyncModalVisible, resetSyncItems } = useSyncStore.getState();
    setSyncModalVisible(false);
    resetSyncItems();
  }, []);

  const refetchTasks = useCallback(async () => {
    if (!isOnline || !isSupabaseConfigured()) {
      return;
    }
    const result = await tasksQuery.refetch();
    if (result.data) {
      lastMergedDataRef.current = null;
      useTaskStore.getState().mergeRemoteTasks(result.data);
    }
    await queryClient.invalidateQueries({ queryKey: [FILTERED_TASKS_KEY] });
  }, [isOnline, tasksQuery, queryClient]);

  return {
    tasksQuery,
    syncNow,
    refetchTasks,
    isRefetching: tasksQuery.isRefetching,
    openSyncModal,
    closeSyncModal,
    unsyncedCount,
    isSyncing: syncMutation.isPending,
  };
};
