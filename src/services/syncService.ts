import type { Task } from '@/types/task';
import type { SyncItem, SyncResult } from '@/types/sync';
import { getSyncAction } from '@/utils/taskMapper';
import { taskService } from './taskService';

const buildSyncItem = (task: Task): SyncItem => ({
  taskId: task.id,
  title: task.title,
  action: getSyncAction(task),
  status: 'pending',
});

export const syncService = {
  async syncTasks(unsyncedTasks: Task[]): Promise<SyncResult> {
    if (unsyncedTasks.length === 0) {
      return { success: true, syncedCount: 0, failedCount: 0, items: [] };
    }

    const items: SyncItem[] = unsyncedTasks.map(buildSyncItem);
    let syncedCount = 0;
    let failedCount = 0;

    for (let index = 0; index < unsyncedTasks.length; index++) {
      const task = unsyncedTasks[index];
      items[index] = { ...items[index], status: 'syncing' };

      try {
        if (task.deleted) {
          await taskService.softDelete(task);
        } else {
          await taskService.upsert(task);
        }
        items[index] = { ...items[index], status: 'success' };
        syncedCount += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown sync error';
        items[index] = { ...items[index], status: 'error', error: message };
        failedCount += 1;
      }
    }

    return {
      success: failedCount === 0,
      syncedCount,
      failedCount,
      items,
      errorMessage:
        failedCount > 0
          ? `${failedCount} task(s) failed to sync. Check details in the sync modal.`
          : undefined,
    };
  },
};
