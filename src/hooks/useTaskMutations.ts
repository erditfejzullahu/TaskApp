import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/config/env';
import { FILTERED_TASKS_KEY } from '@/hooks/useFilteredTasks';
import { performSync } from '@/services/syncOrchestrator';
import { taskService } from '@/services/taskService';
import { useTaskStore } from '@/store/taskStore';
import type { TaskInput } from '@/types/task';
import { useNetworkStatus } from './useNetworkStatus';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();
  const createTask = useTaskStore(state => state.createTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const toggleComplete = useTaskStore(state => state.toggleComplete);

  const syncAfterMutation = useCallback(async () => {
    if (isOnline && isSupabaseConfigured()) {
      await performSync(queryClient);
      await queryClient.invalidateQueries({ queryKey: [FILTERED_TASKS_KEY] });
    }
  }, [isOnline, queryClient]);

  const fetchMutation = useMutation({
    mutationFn: taskService.fetchAll,
    onSuccess: remoteTasks => {
      useTaskStore.getState().mergeRemoteTasks(remoteTasks);
      queryClient.setQueryData(TASKS_QUERY_KEY, remoteTasks);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: TaskInput) => {
      const task = createTask(input);
      if (isOnline && isSupabaseConfigured()) {
        await taskService.upsert(task);
        useTaskStore.getState().markTasksSynced([task.id]);
      }
      return task;
    },
    onSettled: syncAfterMutation,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<TaskInput>;
    }) => {
      const task = updateTask(id, input);
      if (!task) {
        throw new Error('Task not found');
      }
      if (isOnline && isSupabaseConfigured()) {
        await taskService.upsert(task);
        useTaskStore.getState().markTasksSynced([task.id]);
      }
      return task;
    },
    onSettled: syncAfterMutation,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteTask(id);
      const task = useTaskStore.getState().tasks.find(item => item.id === id);
      if (task && isOnline && isSupabaseConfigured()) {
        await taskService.softDelete(task);
        useTaskStore.getState().removeDeletedTasks([id]);
      }
    },
    onSettled: syncAfterMutation,
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const task = toggleComplete(id);
      if (!task) {
        throw new Error('Task not found');
      }
      if (isOnline && isSupabaseConfigured()) {
        await taskService.upsert(task);
        useTaskStore.getState().markTasksSynced([task.id]);
      }
      return task;
    },
    onSettled: syncAfterMutation,
  });

  return {
    fetchMutation,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleMutation,
    tasksQueryKey: TASKS_QUERY_KEY,
  };
};
