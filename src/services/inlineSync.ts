import { InteractionManager } from 'react-native';
import { taskService } from '@/services/taskService';
import { useTaskStore } from '@/store/taskStore';
import type { Task } from '@/types/task';
import { FILTERED_TASKS_KEY } from '@/hooks/useFilteredTasks';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

// Fire-and-forget server push — never block navigation or trigger query invalidation.
export const pushTaskUpsert = (task: Task, queryClient: QueryClient): void => {
  
  void taskService.upsert(task).then(
    () => {
      // InteractionManager.runAfterInteractions(() => {
        useTaskStore.getState().markTasksSynced([task.id]);
      // });
    },
    () => {
      /* stays unsynced; performSync / reconnect will retry */
    },
  );
};

export const pushTaskDelete = (task: Task): void => {
  void taskService.softDelete(task).then(
    () => {
      InteractionManager.runAfterInteractions(() => {
        useTaskStore.getState().removeDeletedTasks([task.id]);
      });
    },
    () => {
      /* stays unsynced */
    },
  );
};
