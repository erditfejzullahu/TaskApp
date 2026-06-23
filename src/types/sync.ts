export type SyncItemStatus = 'pending' | 'syncing' | 'success' | 'error';

export interface SyncItem {
  taskId: string;
  title: string;
  action: 'create' | 'update' | 'delete';
  status: SyncItemStatus;
  error?: string;
}

export type SyncResult = {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  items: SyncItem[];
  errorMessage?: string;
};
