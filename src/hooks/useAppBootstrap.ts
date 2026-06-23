import { useTaskStore } from '@/store/taskStore';
import { useSync } from './useSync';

export const useAppBootstrap = () => {
  const isHydrated = useTaskStore(state => state.isHydrated);
  const sync = useSync();

  const isLoading =
    !isHydrated ||
    (sync.tasksQuery.isLoading && sync.tasksQuery.fetchStatus !== 'idle');

  return {
    isReady: isHydrated,
    isLoading,
    isError: sync.tasksQuery.isError,
    error: sync.tasksQuery.error,
    refetch: sync.tasksQuery.refetch,
    ...sync,
  };
};
