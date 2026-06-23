import type { QueryClient } from '@tanstack/react-query';
import { FILTERED_TASKS_KEY } from '@/hooks/useFilteredTasks';
import { syncService } from '@/services/syncService';
import { useSyncStore } from '@/store/syncStore';
import { useTaskStore } from '@/store/taskStore';
import { getSyncAction } from '@/utils/taskMapper';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const performSync = async (queryClient: QueryClient) => {
  const pending = useTaskStore.getState().getUnsyncedTasks();
  const { setSyncing, setSyncItems, showToast } = useSyncStore.getState();

  if (pending.length === 0) {
    return syncService.syncTasks([]);
  }

  setSyncing(true);
  setSyncItems(
    pending.map(task => ({
      taskId: task.id,
      title: task.title,
      action: getSyncAction(task),
      status: 'pending',
    })),
  );

  const result = await syncService.syncTasks(pending);
  setSyncItems(result.items);

  const syncedIds = result.items
    .filter(item => item.status === 'success')
    .map(item => item.taskId);

  const deletedIds = pending
    .filter(task => task.deleted && syncedIds.includes(task.id))
    .map(task => task.id);

  if (syncedIds.length > 0) {
    useTaskStore.getState().markTasksSynced(syncedIds);
  }

  if (deletedIds.length > 0) {
    useTaskStore.getState().removeDeletedTasks(deletedIds);
  }

  if (result.success) {
    await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: [FILTERED_TASKS_KEY] });
  }

  if (result.syncedCount > 0) {
    if (result.success) {
      showToast(
        'success',
        `Successfully synced ${result.syncedCount} task${result.syncedCount === 1 ? '' : 's'}.`,
      );
    } else {
      showToast(
        'error',
        result.errorMessage ??
          'Some tasks failed to sync. Open the sync panel for details.',
      );
    }
  }

  setSyncing(false);
  return result;
};
