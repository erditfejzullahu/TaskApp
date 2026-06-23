import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/config/env';
import { pushTaskDelete, pushTaskUpsert } from '@/services/inlineSync';
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
        pushTaskUpsert(task, queryClient);
      }
      return task;
    },
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
        pushTaskUpsert(task, queryClient);
      }
      return task;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteTask(id);
      const task = useTaskStore.getState().tasks.find(item => item.id === id);
      if (task && isOnline && isSupabaseConfigured()) {
        pushTaskDelete(task);
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const task = toggleComplete(id);
      if (!task) {
        throw new Error('Task not found');
      }
      if (isOnline && isSupabaseConfigured()) {
        pushTaskUpsert(task, queryClient);
      }
      return task;
    },
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
