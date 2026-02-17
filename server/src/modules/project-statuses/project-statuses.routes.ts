import { Router } from 'express';
import { ProjectStatusesController } from './project-statuses.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  listProjectStatusesSchema,
  createProjectStatusSchema,
} from './project-statuses.validation';

const router = Router();
const projectStatusesController = new ProjectStatusesController();

router.get(
  '/projects/:projectId/statuses',
  authenticate,
  checkPermission('update_project'),
  validate(listProjectStatusesSchema),
  projectStatusesController.listByProject
);

router.post(
  '/projects/:projectId/statuses',
  authenticate,
  checkPermission('update_project'),
  validate(createProjectStatusSchema),
  projectStatusesController.createStatus
);

export { router as projectStatusesRoutes };

