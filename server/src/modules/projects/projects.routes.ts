import { Router } from 'express';
import { ProjectsController } from './projects.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  addMemberSchema,
  getProjectsQuerySchema,
} from './projects.validation';

const router = Router();
const projectsController = new ProjectsController();

router.get(
  '/',
  authenticate,
  validate(getProjectsQuerySchema),
  projectsController.getProjects
);

router.get(
  '/:id',
  authenticate,
  validate(projectIdParamSchema),
  projectsController.getProjectById
);

router.post(
  '/',
  authenticate,
  checkPermission('create_project'),
  validate(createProjectSchema),
  projectsController.createProject
);

router.patch(
  '/:id',
  authenticate,
  checkPermission('update_project'),
  validate(updateProjectSchema),
  projectsController.updateProject
);

router.delete(
  '/:id',
  authenticate,
  checkPermission('delete_project'),
  validate(projectIdParamSchema),
  projectsController.deleteProject
);

router.post(
  '/:id/members',
  authenticate,
  checkPermission('manage_members'),
  validate(addMemberSchema),
  projectsController.addMember
);

export { router as projectsRoutes };
