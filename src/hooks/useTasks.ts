import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '@/store/taskStore';

export const useTasks = () => {
  const { tasks, isHydrated } = useTaskStore(
    useShallow(state => ({
      tasks: state.tasks,
      isHydrated: state.isHydrated,
    })),
  );

  const visibleTasks = useMemo(
    () => tasks.filter(task => !task.deleted),
    [tasks],
  );

  const unsyncedCount = useMemo(
    () => tasks.filter(task => !task.synced).length,
    [tasks],
  );

  return {
    tasks: visibleTasks,
    unsyncedCount,
    isHydrated,
  };
};
