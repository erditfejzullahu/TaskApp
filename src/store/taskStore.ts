import { create } from 'zustand';
import type { Task, TaskInput } from '@/types/task';
import { taskStorage } from '@/storage/taskStorage';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';
import { mergeRemoteWithLocal } from '@/utils/taskMapper';

interface TaskState {
  tasks: Task[];
  isHydrated: boolean;
  hydrate: () => void;
  setTasks: (tasks: Task[]) => void;
  mergeRemoteTasks: (remoteTasks: Task[]) => void;
  createTask: (input: TaskInput) => Task;
  updateTask: (id: string, input: Partial<TaskInput>) => Task | null;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => Task | null;
  markTasksSynced: (ids: string[]) => void;
  removeDeletedTasks: (ids: string[]) => void;
  getVisibleTasks: () => Task[];
  getUnsyncedTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
}

const persist = (tasks: Task[]) => {
  taskStorage.saveAll(tasks);
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isHydrated: false,

  hydrate: () => {
    const tasks = taskStorage.getAll();
    set({ tasks, isHydrated: true });
  },

  setTasks: tasks => {
    persist(tasks);
    set({ tasks });
  },

  mergeRemoteTasks: remoteTasks => {
    const current = get().tasks;
    const merged = mergeRemoteWithLocal(remoteTasks, current);

    if (
      merged.length === current.length &&
      merged.every(
        (task, index) =>
          task.id === current[index]?.id &&
          task.updatedAt === current[index]?.updatedAt &&
          task.synced === current[index]?.synced &&
          task.deleted === current[index]?.deleted,
      )
    ) {
      return;
    }

    persist(merged);
    set({ tasks: merged });
  },

  createTask: input => {
    const timestamp = nowISO();
    const task: Task = {
      id: generateId(),
      title: input.title.trim(),
      description: input.description.trim(),
      completed: input.completed ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
      synced: false,
      deleted: false,
    };

    const tasks = [task, ...get().tasks];
    persist(tasks);
    set({ tasks });
    return task;
  },

  updateTask: (id, input) => {
    let updated: Task | null = null;
    const tasks = get().tasks.map(task => {
      if (task.id !== id) {
        return task;
      }
      updated = {
        ...task,
        ...input,
        title: input.title !== undefined ? input.title.trim() : task.title,
        description:
          input.description !== undefined
            ? input.description.trim()
            : task.description,
        updatedAt: nowISO(),
        synced: false,
      };
      return updated;
    });

    if (!updated) {
      return null;
    }

    persist(tasks);
    set({ tasks });
    return updated;
  },

  deleteTask: id => {
    const tasks = get().tasks.map(task =>
      task.id === id
        ? { ...task, deleted: true, synced: false, updatedAt: nowISO() }
        : task,
    );
    persist(tasks);
    set({ tasks });
  },

  toggleComplete: id => {
    let updated: Task | null = null;
    const tasks = get().tasks.map(task => {
      if (task.id !== id) {
        return task;
      }
      updated = {
        ...task,
        completed: !task.completed,
        updatedAt: nowISO(),
        synced: false,
      };
      return updated;
    });

    if (!updated) {
      return null;
    }

    persist(tasks);
    set({ tasks });
    return updated;
  },

  markTasksSynced: ids => {
    const idSet = new Set(ids);
    let changed = false;

    const tasks = get().tasks.map(task => {
      if (!idSet.has(task.id) || task.synced) {
        return task;
      }
      changed = true;
      return { ...task, synced: true };
    });

    if (!changed) {
      return;
    }

    persist(tasks);
    set({ tasks });
  },

  removeDeletedTasks: ids => {
    const idSet = new Set(ids);
    const tasks = get().tasks.filter(task => !idSet.has(task.id));
    persist(tasks);
    set({ tasks });
  },

  getVisibleTasks: () => get().tasks.filter(task => !task.deleted),

  getUnsyncedTasks: () => get().tasks.filter(task => !task.synced),

  getTaskById: id => get().tasks.find(task => task.id === id && !task.deleted),
}));
