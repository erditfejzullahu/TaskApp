export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  deleted: boolean;
}

export type TaskInput = Pick<Task, 'title' | 'description' | 'completed'>;

export type CompletionFilter = 'all' | 'active' | 'completed';

export interface SupabaseTaskRow {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}
