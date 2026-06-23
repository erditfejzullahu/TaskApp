import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/config/env';
import { taskService } from '@/services/taskService';
import { useTaskStore } from '@/store/taskStore';
import type { CompletionFilter, Task } from '@/types/task';
import { applyClientTaskFilters } from '@/utils/taskFilters';
import { useDebounce, useDebouncedLoading } from './useDebounce';
import { useNetworkStatus } from './useNetworkStatus';

export const FILTERED_TASKS_KEY = 'tasks-filtered';

// List always renders from the local store (instant, survives mutations).
// Debounced search/filter fires a server request that merges into the store.
export const useFilteredTasks = (
  localTasks: Task[],
  searchQuery: string,
  filter: CompletionFilter,
) => {
  const { isOnline, isReady } = useNetworkStatus();
  const debouncedSearch = useDebounce(searchQuery, 350);
  const debouncedFilter = useDebounce(filter, 200);

  const isSearching = useDebouncedLoading(searchQuery, debouncedSearch);
  const isFiltering = useDebouncedLoading(filter, debouncedFilter);

  const useServer = isOnline && isReady && isSupabaseConfigured();

  const serverQuery = useQuery({
    queryKey: [FILTERED_TASKS_KEY, debouncedSearch, debouncedFilter],
    queryFn: () =>
      taskService.fetchFiltered({
        search: debouncedSearch,
        filter: debouncedFilter,
      }),
    enabled: useServer,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const lastMergedRef = useRef<unknown>(null);

  useEffect(() => {
    if (
      !serverQuery.isFetched ||
      serverQuery.isFetching ||
      !serverQuery.data ||
      serverQuery.data === lastMergedRef.current
    ) {
      return;
    }
    lastMergedRef.current = serverQuery.data;
    useTaskStore.getState().mergeRemoteTasks(serverQuery.data);
  }, [serverQuery.isFetched, serverQuery.isFetching, serverQuery.data]);

  const tasks = useMemo(
    () => applyClientTaskFilters(localTasks, searchQuery, filter),
    [localTasks, searchQuery, filter],
  );

  const isProcessing = isSearching || isFiltering;
  const showEmptyState = !isProcessing && tasks.length === 0;

  return useMemo(
    () => ({
      tasks,
      isSearching,
      isFiltering,
      isProcessing,
      showEmptyState,
      isServerMode: useServer,
      isError: useServer && serverQuery.isError,
      error: serverQuery.error,
      refetch: serverQuery.refetch,
    }),
    [
      tasks,
      isSearching,
      isFiltering,
      isProcessing,
      showEmptyState,
      useServer,
      serverQuery.isError,
      serverQuery.error,
      serverQuery.refetch,
    ],
  );
};
