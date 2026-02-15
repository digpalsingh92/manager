import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateUserRoleSchema, getUsersQuerySchema } from './users.validation';

const router = Router();
const usersController = new UsersController();

router.get(
  '/',
  authenticate,
  checkPermission('manage_users'),
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
