import type { CompletionFilter, Task } from '@/types/task';
import { mapRowToTask, mapTaskToRow } from '@/utils/taskMapper';
import { getSupabaseClient, TASKS_TABLE } from './supabase';

export interface TaskQueryParams {
  search?: string;
  filter?: CompletionFilter;
}

export const taskService = {
  async fetchAll(): Promise<Task[]> {
    return taskService.fetchFiltered({});
  },

  async fetchFiltered({
    search = '',
    filter = 'all',
  }: TaskQueryParams): Promise<Task[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return [];
    }

    let query = supabase
      .from(TASKS_TABLE)
      .select('*')
      .eq('deleted', false);

    if (filter === 'active') {
      query = query.eq('completed', false);
    } else if (filter === 'completed') {
      query = query.eq('completed', true);
    }

    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      query = query.ilike('title', `%${trimmedSearch}%`);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapRowToTask);
  },

  async upsert(task: Task): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase
      .from(TASKS_TABLE)
      .upsert(mapTaskToRow(task), { onConflict: 'id' });

    if (error) {
      throw new Error(error.message);
    }
  },

  async softDelete(task: Task): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase
      .from(TASKS_TABLE)
      .update({
        deleted: true,
        updated_at: task.updatedAt,
      })
      .eq('id', task.id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
