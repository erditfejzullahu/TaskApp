import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/config/env';
import { taskService } from '@/services/taskService';
import type { CompletionFilter, Task } from '@/types/task';
import {
  applyClientTaskFilters,
  mergeServerTasksWithLocalUnsynced,
} from '@/utils/taskFilters';
import { useDebounce, useDebouncedLoading } from './useDebounce';
import { useNetworkStatus } from './useNetworkStatus';

const FILTERED_TASKS_KEY = 'tasks-filtered';

// This hook is used to fetch the filtered tasks from the server -> if online request the server, if offline use the local tasks.
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
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });

  const clientPreview = useMemo(
    () =>
      applyClientTaskFilters(localTasks, debouncedSearch, debouncedFilter),
    [localTasks, debouncedSearch, debouncedFilter],
  );

  const tasks = useMemo(() => {
    if (!useServer) {
      return clientPreview;
    }

    // While the server request is in flight, keep showing local preview
    if (serverQuery.isFetching || serverQuery.isLoading) {
      return clientPreview;
    }

    if (serverQuery.data === undefined) {
      return clientPreview;
    }

    return mergeServerTasksWithLocalUnsynced(
      serverQuery.data,
      localTasks,
      debouncedSearch,
      debouncedFilter,
    );
  }, [
    useServer,
    clientPreview,
    localTasks,
    serverQuery.data,
    serverQuery.isFetching,
    serverQuery.isLoading,
    debouncedSearch,
    debouncedFilter,
  ]);

  const isProcessing =
    isSearching ||
    isFiltering ||
    (useServer && serverQuery.isFetching);

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
      isRefetching: useServer && serverQuery.isRefetching,
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
      serverQuery.isRefetching,
    ],
  );
};

export { FILTERED_TASKS_KEY };
