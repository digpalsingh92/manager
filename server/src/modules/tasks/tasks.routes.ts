import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/permission.middleware';
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
  checkPermission('create_task'),
  validate(createTaskSchema),
  tasksController.createTask
);

router.patch(
  '/:id',
  authenticate,
  checkPermission('update_task'),
  validate(updateTaskSchema),
  tasksController.updateTask
);

router.delete(
  '/:id',
  authenticate,
  checkPermission('delete_task'),
  validate(taskIdParamSchema),
  tasksController.deleteTask
);

router.patch(
  '/:id/move',
  authenticate,
  checkPermission('move_task'),
  validate(moveTaskSchema),
  tasksController.moveTask
);

router.patch(
  '/:id/assign',
  authenticate,
  checkPermission('assign_task'),
  validate(assignTaskSchema),
  tasksController.assignTask
);

export { router as tasksRoutes };
