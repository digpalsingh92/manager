import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateUserRoleSchema, getUsersQuerySchema } from './users.validation';

const router = Router();
const usersController = new UsersController();

// Admin user management (full access)
router.get(
  '/',
  authenticate,
  checkPermission('manage_users'),
  validate(getUsersQuerySchema),
  usersController.getUsers
);

// User search for project membership (Admin + Project Manager via `manage_members`)
router.get(
  '/search',
  authenticate,
  checkPermission('manage_members'),
  validate(getUsersQuerySchema),
  usersController.getUsers
);

router.patch(
  '/:id/role',
  authenticate,
  checkPermission('manage_users'),
  validate(updateUserRoleSchema),
  usersController.updateUserRole
);

export { router as usersRoutes };
