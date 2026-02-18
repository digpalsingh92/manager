import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkWorkspacePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  assignTaskSchema,
  taskIdParamSchema,
  tasksByProjectSchema,
} from './tasks.validation';

const router = Router();
const tasksController = new TasksController();

router.get(
  '/project/:projectId',
  authenticate,
  validate(tasksByProjectSchema),
  tasksController.getTasksByProject
);

router.post(
  '/',
  authenticate,
  checkWorkspacePermission('create_task'),
  validate(createTaskSchema),
  tasksController.createTask
);

router.patch(
  '/:id',
  authenticate,
  checkWorkspacePermission('update_task'),
  validate(updateTaskSchema),
  tasksController.updateTask
);

router.delete(
  '/:id',
  authenticate,
  checkWorkspacePermission('delete_task'),
  validate(taskIdParamSchema),
  tasksController.deleteTask
);

router.patch(
  '/:id/move',
  authenticate,
  checkWorkspacePermission('move_task'),
  validate(moveTaskSchema),
  tasksController.moveTask
);

router.patch(
  '/:id/assign',
  authenticate,
  checkWorkspacePermission('assign_task'),
  validate(assignTaskSchema),
  tasksController.assignTask
);

export { router as tasksRoutes };
