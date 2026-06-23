import type { Task } from '@/types/task';
import { STORAGE_KEYS, storage } from './mmkv';

export const taskStorage = {
  getAll(): Task[] {
    const raw = storage.getString(STORAGE_KEYS.TASKS);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as Task[];
    } catch {
      return [];
    }
  },

  saveAll(tasks: Task[]): void {
    storage.set(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  clear(): void {
    storage.remove(STORAGE_KEYS.TASKS);
  },
};
