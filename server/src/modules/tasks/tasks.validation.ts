import { z } from 'zod';

const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']);
const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Task title is required' })
      .min(1, 'Task title is required')
      .max(200, 'Task title must not exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .optional(),
    status: taskStatusEnum.default('TODO').optional(), // legacy, will be mapped to statusId
    statusId: z.string().uuid('Invalid status ID').optional(),
    priority: taskPriorityEnum.default('MEDIUM').optional(),
    projectId: z
      .string({ required_error: 'Project ID is required' })
      .uuid('Invalid project ID'),
    assigneeId: z.string().uuid('Invalid assignee ID').optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    title: z
      .string()
      .min(1)
      .max(200)
      .trim()
      .optional(),
    description: z.string().max(2000).optional().nullable(),
    status: taskStatusEnum.optional(), // legacy
    statusId: z.string().uuid('Invalid status ID').optional(),
    priority: taskPriorityEnum.optional(),
    dueDate: z.coerce.date().optional().nullable(),
  }),
});

export const moveTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z
    .object({
      status: taskStatusEnum.optional(), // legacy
      statusId: z.string().uuid('Invalid status ID').optional(),
    })
    .refine((body) => body.status || body.statusId, {
      message: 'Either status or statusId must be provided',
    }),
});

export const assignTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    assigneeId: z
      .string({ required_error: 'Assignee ID is required' })
      .uuid('Invalid assignee ID')
      .nullable(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
});

export const tasksByProjectSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional(),
    status: taskStatusEnum.optional(), // legacy
    statusId: z.string().uuid('Invalid status ID').optional(),
    priority: taskPriorityEnum.optional(),
    assigneeId: z.string().uuid().optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type TasksByProjectQuery = z.infer<typeof tasksByProjectSchema>;
