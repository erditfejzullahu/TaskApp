import type { CompletionFilter, Task } from '@/types/task';

export const applyClientTaskFilters = (
  tasks: Task[],
  search: string,
  filter: CompletionFilter,
): Task[] => {
  let result = tasks;

  const query = search.trim().toLowerCase();
  if (query) {
    result = result.filter(task => task.title.toLowerCase().includes(query));
  }

  switch (filter) {
    case 'active':
      return result.filter(task => !task.completed);
    case 'completed':
      return result.filter(task => task.completed);
    default:
      return result;
  }
};

export const mergeServerTasksWithLocalUnsynced = (
  serverTasks: Task[],
  localTasks: Task[],
  search: string,
  filter: CompletionFilter,
): Task[] => {
  const unsyncedMatching = applyClientTaskFilters(
    localTasks.filter(task => !task.synced),
    search,
    filter,
  );

  const serverIds = new Set(serverTasks.map(task => task.id));
  const localOnly = unsyncedMatching.filter(task => !serverIds.has(task.id));

  return [...localOnly, ...serverTasks].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};
