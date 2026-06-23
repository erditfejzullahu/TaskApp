import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'task-app-storage' });

export const STORAGE_KEYS = {
  TASKS: 'tasks',
} as const;
