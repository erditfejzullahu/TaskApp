import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be 120 characters or less'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or less'),
  completed: z.boolean(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const defaultTaskFormValues: TaskFormValues = {
  title: '',
  description: '',
  completed: false,
};
