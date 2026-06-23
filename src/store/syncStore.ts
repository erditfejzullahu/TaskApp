import { create } from 'zustand';
import type { SyncItem } from '@/types/sync';

type ToastType = 'success' | 'error';

interface SyncState {
  isSyncing: boolean;
  syncModalVisible: boolean;
  syncItems: SyncItem[];
  toastVisible: boolean;
  toastType: ToastType;
  toastMessage: string;
  setSyncing: (value: boolean) => void;
  setSyncModalVisible: (value: boolean) => void;
  setSyncItems: (items: SyncItem[]) => void;
  showToast: (type: ToastType, message: string) => void;
  hideToast: () => void;
  resetSyncItems: () => void;
}

export const useSyncStore = create<SyncState>(set => ({
  isSyncing: false,
  syncModalVisible: false,
  syncItems: [],
  toastVisible: false,
  toastType: 'success',
  toastMessage: '',

  setSyncing: value => set({ isSyncing: value }),
  setSyncModalVisible: value => set({ syncModalVisible: value }),
  setSyncItems: items => set({ syncItems: items }),
  showToast: (type, message) =>
    set({ toastVisible: true, toastType: type, toastMessage: message }),
  hideToast: () => set({ toastVisible: false }),
  resetSyncItems: () => set({ syncItems: [] }),
}));
