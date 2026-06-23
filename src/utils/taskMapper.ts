import type { SupabaseTaskRow, Task } from '@/types/task';

export const mapRowToTask = (row: SupabaseTaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  completed: row.completed,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  synced: true,
  deleted: row.deleted ?? false,
});

export const mapTaskToRow = (task: Task): SupabaseTaskRow => ({
  id: task.id,
  title: task.title,
  description: task.description,
  completed: task.completed,
  created_at: task.createdAt,
  updated_at: task.updatedAt,
  deleted: task.deleted,
});

export const getSyncAction = (
  task: Task,
): 'create' | 'update' | 'delete' => {
  if (task.deleted) {
    return 'delete';
  }
  return 'update';
};

export const mergeRemoteWithLocal = (
  remote: Task[],
  local: Task[],
): Task[] => {
  const merged = new Map<string, Task>();

  remote.forEach(task => {
    if (!task.deleted) {
      merged.set(task.id, task);
    }
  });

  local.forEach(task => {
    const existing = merged.get(task.id);
    if (!task.synced) {
      if (!task.deleted) {
        merged.set(task.id, task);
      } else {
        merged.delete(task.id);
      }
      return;
    }

    if (task.deleted) {
      merged.delete(task.id);
      return;
    }

    if (!existing || new Date(task.updatedAt) >= new Date(existing.updatedAt)) {
      merged.set(task.id, task);
    }
  });

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};
