import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z
    .string()
    .optional()
    .transform((v) => v ?? null),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  completed: z.boolean().optional(),
});

export const replaceTodoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  completed: z.boolean().optional(),
});

export const todoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const todoListSchema = z.array(todoSchema);

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const completedQuerySchema = z.object({
  completed: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ReplaceTodoInput = z.infer<typeof replaceTodoSchema>;
export type Todo = z.infer<typeof todoSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type CompletedQuery = z.infer<typeof completedQuerySchema>;
